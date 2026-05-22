import { DRIZZLE, type DrizzleDB } from '@/database/drizzle.provider';
import { type NewUser, type User, users } from '@/database/schema';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class UserService {
	constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

	private buildWhere(where: Partial<User>) {
		const conditions = (Object.keys(where) as (keyof User)[])
			.filter((key) => where[key] !== undefined)
			.map((key) => eq(users[key], where[key] as never));
		return and(...conditions, isNull(users.deletedAt));
	}

	async findOneBy(where: Partial<User>): Promise<User | null> {
		const [user] = await this.db.select().from(users).where(this.buildWhere(where)).limit(1);
		return user ?? null;
	}

	async findBy(where: Partial<User>): Promise<User[]> {
		return this.db.select().from(users).where(this.buildWhere(where));
	}

	create(user: Partial<NewUser>): NewUser {
		return user as NewUser;
	}

	async save(user: Partial<User>) {
		try {
			if (user.id) {
				const { id, createdAt, updatedAt, ...changes } = user;
				const [updated] = await this.db.update(users).set(changes).where(eq(users.id, id)).returning();
				return [null, updated] as const;
			}

			const [created] = await this.db
				.insert(users)
				.values(user as NewUser)
				.returning();
			return [null, created] as const;
		} catch (error) {
			return [error as Error, null] as const;
		}
	}

	async softDelete(user: User) {
		const [deleted] = await this.db
			.update(users)
			.set({ deletedAt: new Date(), email: `${user.email}-${user.id}-deleted` })
			.where(eq(users.id, user.id))
			.returning();
		return deleted;
	}

	async remove(user: User) {
		const [removed] = await this.db.delete(users).where(eq(users.id, user.id)).returning();
		return removed;
	}
}
