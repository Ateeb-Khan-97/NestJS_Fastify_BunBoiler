import {
	BadRequestException,
	ConflictException,
	Controller,
	HttpStatus,
	Logger,
	Body,
	Post,
	UnauthorizedException,
	Request,
	Response,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@/shared/decorators/public.decorator';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { ResponseMapper } from '@/shared/mappers/response.map';
import { UserService } from '../users/user.service';
import { AuthService } from './auth.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { TokenType } from '@/shared/enums/auth.enum';
import { env } from '@/config/env.config';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {}

	@Public()
	@Post('sign-in')
	async signinHandler(@Body() body: SigninDto, @Response({ passthrough: true }) res: FastifyReply) {
		const user = await this.userService.findOneBy({ email: body.email });
		if (!user) throw new BadRequestException('Invalid credentials');
		if (!(await Bun.password.verify(body.password, user.password)))
			throw new BadRequestException('Invalid credentials');

		const [accessToken, refreshToken] = await this.authService.generateAuthTokens(user.id);
		this.setAuthCookies(res, accessToken, refreshToken);

		return ResponseMapper.map({ message: 'Signed in successfully' });
	}

	@Public()
	@Post('sign-up')
	async signupHandler(@Body() body: SignupDto) {
		const emailCheck = await this.userService.findOneBy({ email: body.email });
		if (emailCheck) throw new ConflictException('Email already registered');

		body.password = await Bun.password.hash(body.password);
		const user = this.userService.create(body);
		const [error] = await this.userService.save(user);
		if (error) {
			this.logger.error(error.message);
			throw new BadRequestException('Failed to register, Please try later');
		}

		return ResponseMapper.map({
			message: 'User registered successfully',
			status: HttpStatus.CREATED,
		});
	}

	@Public()
	@Post('refresh-access')
	async refreshAccessHandler(
		@Request() req: FastifyRequest,
		@Response({ passthrough: true }) res: FastifyReply,
	) {
		const refreshToken = this.authService.extractTokenFromCookie(req, TokenType.REFRESH);
		if (!refreshToken) throw new UnauthorizedException();

		const payload = await this.authService.verifyToken(refreshToken, TokenType.REFRESH);
		if (!payload) throw new UnauthorizedException();
		if (this.authService.isBlockedToken(payload.tokenId)) throw new UnauthorizedException();

		const user = await this.userService.findOneBy({ id: payload.userId });
		if (!user) throw new UnauthorizedException();

		const [accessToken, newRefreshToken] = await this.authService.generateAuthTokens(user.id);
		this.setAuthCookies(res, accessToken, newRefreshToken);

		return ResponseMapper.map({ message: 'Session refreshed' });
	}

	@ApiBearerAuth('access-token')
	@Post('sign-out')
	async signoutHandler(@Request() req: FastifyRequest, @Response({ passthrough: true }) res: FastifyReply) {
		let token = this.authService.extractTokenFromHeader(req);
		if (!token) token = this.authService.extractTokenFromCookie(req, TokenType.ACCESS);
		if (!token) throw new UnauthorizedException();
		await this.authService.revokeToken(token);
		this.removeAuthCookies(res);
		return ResponseMapper.map({ message: 'Signed out successfully' });
	}

	private setAuthCookies(res: FastifyReply, accessToken: string, refreshToken: string) {
		res.setCookie(TokenType.REFRESH, refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: env.JWT_REFRESH_EXP,
		});
		res.setCookie(TokenType.ACCESS, accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
			maxAge: env.JWT_ACCESS_EXP,
		});
	}

	private removeAuthCookies(res: FastifyReply) {
		res.clearCookie(TokenType.REFRESH, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
		});
		res.clearCookie(TokenType.ACCESS, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/',
		});
	}
}
