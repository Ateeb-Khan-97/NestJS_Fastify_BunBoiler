import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { auditColumns } from './_shared';

export const users = pgTable('users', {
	...auditColumns,
	fullName: varchar('fullName').notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
