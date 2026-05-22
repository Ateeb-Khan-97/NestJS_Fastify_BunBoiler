// Barrel of all Drizzle table schemas. Imported both by the runtime drizzle
// client (for typing + relational queries) and by drizzle-kit (see drizzle.config.ts).
// Keep imports here relative so drizzle-kit can load it without TS path aliases.
export * from './users';
