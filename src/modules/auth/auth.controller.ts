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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@/shared/decorators/public.decorator';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { RefreshAccessDto } from './dto/refresh.dto';
import { ResponseMapper } from '@/shared/mappers/response.map';
import { UserService } from '../users/user.service';
import { CommonService } from '@/shared/services/common.service';
import { AuthService } from './auth.service';
import { TokenType } from '../../shared/enums/auth.enum';
import type { FastifyRequest } from 'fastify';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);
	constructor(
		private readonly userService: UserService,
		private readonly commonService: CommonService,
		private readonly authService: AuthService,
	) {}

	@Public()
	@Post('sign-in')
	async signinHandler(@Body() body: SigninDto) {
		const user = await this.userService.findOneBy({ email: body.email });
		if (!user) throw new BadRequestException('Invalid credentials');
		if (!(await Bun.password.verify(body.password, user.password)))
			throw new BadRequestException('Invalid credentials');

		const [accessToken, refreshToken] = await this.authService.generateAuthTokens(user.id);
		const userWithoutPass = this.commonService.omit(user, ['password', 'deletedAt']);

		return ResponseMapper.map({
			message: 'Signed in successfully',
			data: { user: userWithoutPass, accessToken, refreshToken },
		});
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
	async refreshAccessHandler(@Body() body: RefreshAccessDto) {
		const payload = await this.authService.verifyToken(body.refreshToken, TokenType.REFRESH);
		if (!payload) throw new UnauthorizedException('Invalid refresh token');
		if (this.authService.isBlockedToken(payload.tokenId)) throw new UnauthorizedException('Token is blocked');

		const user = await this.userService.findOneBy({ id: payload.userId });
		if (!user) throw new UnauthorizedException('Invalid refresh token');

		const [accessToken, refreshToken] = await this.authService.generateAuthTokens(user.id);
		const userWithoutPass = this.commonService.omit(user, ['password', 'deletedAt']);

		return ResponseMapper.map({
			message: 'Session refreshed',
			data: { user: userWithoutPass, accessToken, refreshToken },
		});
	}

	@ApiBearerAuth('access-token')
	@Post('sign-out')
	async signoutHandler(@Request() req: FastifyRequest) {
		const token = this.authService.extractTokenFromHeader(req);
		if (!token) throw new UnauthorizedException('Invalid token');
		await this.authService.revokeToken(token);
		return ResponseMapper.map({ message: 'Signed out successfully' });
	}
}
