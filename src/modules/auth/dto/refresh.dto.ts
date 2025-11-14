import { ApiProperty } from '@nestjs/swagger';

export abstract class RefreshAccessDto {
	@ApiProperty({
		example: 'some-refresh-token',
		description: 'The refresh token to be used for refreshing access tokens',
	})
	refreshToken: string;
}
