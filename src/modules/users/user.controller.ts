import {
	BadRequestException,
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Put,
	UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { CommonService } from '@/shared/services/common.service';
import { ResponseMapper } from '@/shared/mappers/response.map';
import { ChangePasswordDto, UserUpdateDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('/api/users')
export class UserController {
	private readonly logger = new Logger(UserController.name);

	constructor(
		private readonly userService: UserService,
		private readonly commonService: CommonService,
	) {}

	@ApiBearerAuth('access-token')
	@Get('/me')
	public async getProfileHandler(@CurrentUser() userId: string) {
		const user = await this.userService.findOneBy({ id: userId });
		if (!user || user.deletedAt) throw new NotFoundException('User not found');

		const userWithoutPassword = this.commonService.omit(user, ['password', 'deletedAt']);
		return ResponseMapper.map({ message: 'Profile fetched', data: userWithoutPassword });
	}

	@ApiBearerAuth('access-token')
	@Put('/me')
	public async profileUpdateHandler(@CurrentUser() userId: string, @Body() body: UserUpdateDto) {
		const user = await this.userService.findOneBy({ id: userId });
		if (!user || user.deletedAt) throw new NotFoundException('User not found');

		const updateData = Object.assign(user, body);
		const [error] = await this.userService.save(updateData);
		if (error) {
			this.logger.error(error.message);
			throw new InternalServerErrorException('Failed to update user, Please try later');
		}

		return ResponseMapper.map({ message: 'User updated' });
	}

	@ApiBearerAuth('access-token')
	@Put('change-password')
	public async changePasswordHandler(@CurrentUser() userId: string, @Body() body: ChangePasswordDto) {
		if (body.confirmPassword !== body.newPassword) throw new BadRequestException('Passwords do not match');

		const user = await this.userService.findOneBy({ id: userId });
		if (!user || user.deletedAt) throw new NotFoundException('User not found');

		if (!(await Bun.password.verify(body.oldPassword, user.password))) throw new UnauthorizedException();

		user.password = await Bun.password.hash(body.newPassword);
		const [error] = await this.userService.save(user);
		if (error) {
			this.logger.error(error.message);
			throw new InternalServerErrorException('Failed to update password, Please try later');
		}
		return ResponseMapper.map({ message: 'Password updated successfully' });
	}
}
