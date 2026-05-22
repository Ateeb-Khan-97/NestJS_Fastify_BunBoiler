import { serial, timestamp } from 'drizzle-orm/pg-core';

/**
 * Shared audit columns, mirroring the former TypeORM `GeneralEntity`.
 * Spread into a `pgTable` definition to add `id` + timestamps:
 *   pgTable('foo', { ...auditColumns, ...ownColumns })
 *
 * `deletedAt` enables soft deletes — queries should filter `isNull(deletedAt)`.
 */
export const auditColumns = {
	id: serial('id').primaryKey(),
	createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	deletedAt: timestamp('deletedAt', { withTimezone: true }),
};
