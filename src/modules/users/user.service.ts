import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import type { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepo: Repository<UserEntity>,
	) {}

	async findOneBy(where: FindOptionsWhere<UserEntity>) {
		return this.userRepo.findOne({ where });
	}

	async findBy(where: FindOptionsWhere<UserEntity>) {
		return this.userRepo.find({ where });
	}

	create(user: DeepPartial<UserEntity>) {
		return this.userRepo.create(user);
	}

	async save(user: UserEntity) {
		try {
			return [null, await this.userRepo.save(user)] as const;
		} catch (error) {
			return [error as Error, null] as const;
		}
	}

	async softDelete(user: UserEntity) {
		user.deletedAt = new Date();
		return this.userRepo.save(user);
	}

	async remove(user: UserEntity) {
		return this.userRepo.remove(user);
	}
}
