import { PrismaService } from '@/database/prisma.service';
import type { Prisma, User } from '@/generated/prisma/client';
import { CommonService } from '@/shared/services/common.service';
import { Injectable } from '@nestjs/common';

export type { User };
export type NewUser = Prisma.UserUncheckedCreateInput;

@Injectable()
export class UserService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly commonService: CommonService,
	) {}

	private buildWhere(where: Partial<User>): Prisma.UserWhereInput {
		const conditions: Prisma.UserWhereInput = { deletedAt: null };
		for (const key of Object.keys(where) as (keyof User)[]) {
			if (where[key] !== undefined) {
				(conditions as Record<string, unknown>)[key] = where[key];
			}
		}
		return conditions;
	}

	async findOneBy(where: Partial<User>): Promise<User | null> {
		return this.prisma.user.findFirst({ where: this.buildWhere(where) });
	}

	async findBy(where: Partial<User>): Promise<User[]> {
		return this.prisma.user.findMany({ where: this.buildWhere(where) });
	}

	create(user: Partial<User>): Partial<User> {
		return user;
	}

	async save(user: Partial<User>) {
		try {
			if (user.id) {
				const changes = this.commonService.omit(user, ['id', 'createdAt', 'updatedAt']);
				const updated = await this.prisma.user.update({
					where: { id: user.id },
					data: changes as Prisma.UserUpdateInput,
				});
				return [null, updated] as const;
			}

			const created = await this.prisma.user.create({ data: user as NewUser });
			return [null, created] as const;
		} catch (error) {
			return [error as Error, null] as const;
		}
	}

	async softDelete(user: User) {
		return this.prisma.user.update({
			where: { id: user.id },
			data: { deletedAt: new Date(), email: `${user.email}-${user.id}-deleted` },
		});
	}

	async remove(user: User) {
		return this.prisma.user.delete({ where: { id: user.id } });
	}
}
