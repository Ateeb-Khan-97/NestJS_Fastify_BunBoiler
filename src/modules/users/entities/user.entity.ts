import { GeneralEntity } from '@/shared/entities/general.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends GeneralEntity {
	@Column()
	fullName: string;

	@Column({ unique: true, length: 255 })
	email: string;

	@Column({ length: 255 })
	password: string;
}
