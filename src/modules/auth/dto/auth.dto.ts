import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export abstract class SigninDto {
	@ApiProperty({
		example: 'user@example.com',
		description: 'User email',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		example: 'password123',
		description: 'User password',
	})
	@IsString()
	@Length(8, 32)
	password: string;
}

export abstract class SignupDto extends SigninDto {}
