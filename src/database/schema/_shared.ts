import { serial, timestamp } from 'drizzle-orm/pg-core';

export const auditColumns = {
	id: serial('id').primaryKey(),
	createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updatedAt', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	deletedAt: timestamp('deletedAt', { withTimezone: true }),
};
