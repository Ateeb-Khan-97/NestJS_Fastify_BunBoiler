import { BadGatewayException, Body, Controller, Get, NotFoundException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { CommonService } from '@/shared/services/common.service';
import { ResponseMapper } from '@/shared/mappers/response.map';
import { UserUpdateDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('/api/users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly commonService: CommonService,
	) {}

	@ApiBearerAuth('access-token')
	@Get('/me')
	public async getProfileHandler(@CurrentUser() userId: number) {
		const user = await this.userService.findOneBy({ id: userId });
		if (!user || user.deletedAt) throw new NotFoundException('User not found');

		const userWithoutPassword = this.commonService.omit(user, ['password', 'deletedAt']);
		return ResponseMapper.map({ message: 'Profile fetched', data: userWithoutPassword });
	}

	@ApiBearerAuth('access-token')
	@Put('/me')
	public async profileUpdateHandler(@CurrentUser() userId: number, @Body() body: UserUpdateDto) {
		const user = await this.userService.findOneBy({ id: userId });
		if (!user || user.deletedAt) throw new NotFoundException('User not found');

		const updateData = Object.assign(user, body);
		const [error] = await this.userService.save(updateData);
		if (error) throw new BadGatewayException('Failed to update user, Please try later');

		return ResponseMapper.map({ message: 'User updated' });
	}
}
