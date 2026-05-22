# NestJS Fastify Boilerplate

A high-performance boilerplate application built with [NestJS](https://nestjs.com/) and [Fastify](https://www.fastify.io/), using [Bun](https://bun.sh/) as the runtime.

## Features

- **Runtime**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.
- **Framework**: [NestJS](https://nestjs.com/) (v11) - A progressive Node.js framework for building efficient, scalable Node.js server-side applications.
- **HTTP Adapter**: [Fastify](https://www.fastify.io/) - High performance and low overhead web framework.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/), using [Bun's native SQL driver](https://bun.sh/docs/api/sql) (`drizzle-orm/bun-sql`) — no `pg` package needed at runtime.
- **Authentication**: JWT-based authentication with Access and Refresh tokens.
- **Validation**: [Zod](https://zod.dev/) and `class-validator`.
- **Documentation**: [Swagger](https://swagger.io/) and [Scalar](https://scalar.com/) for API reference.
- **Tooling**: [Biome](https://biomejs.dev/) for fast formatting and linting.
- **Containerization**: Docker and Docker Compose support.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later)
- [Docker](https://www.docker.com/) (optional, for running the database)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd nest-js-fastify
    ```

2.  Install dependencies:
    ```bash
    bun install
    ```

3.  Set up environment variables:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your configuration. At minimum set `PG_URL` (and `PG_SSL=true` if your database requires TLS).

4.  Set up the database schema:

    For a **fresh database**, apply the generated migrations:
    ```bash
    bun run db:migrate
    ```

    For **local development** (or to sync the schema after editing it), push the schema directly:
    ```bash
    bun run db:push
    ```

    > `db:push` and `db:migrate` connect to the database and may prompt before destructive changes, so run them in an interactive terminal (not CI/piped input).

## Database (Drizzle ORM)

Table schemas live in `src/database/schema/` (e.g. `users.ts`, with shared audit columns in `_shared.ts`). After changing a schema, generate a migration and apply it:

```bash
bun run db:generate   # create a SQL migration in ./drizzle from schema changes
bun run db:migrate    # apply pending migrations to the database
bun run db:push       # alternatively, push the schema directly (handy in dev)
bun run db:studio     # browse the database in Drizzle Studio
```

The database connection is provided app-wide via the `DRIZZLE` injection token (`src/database/drizzle.provider.ts`). Inject it into any service:

```ts
import { DRIZZLE, type DrizzleDB } from '@/database/drizzle.provider';

@Injectable()
export class SomeService {
	constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}
}
```

## Running the Application

### Development

To run the application in development mode with hot reloading:

```bash
bun dev
```

### Production

To build and run the application in production mode:

```bash
bun run build
bun start
```

### Docker

To run the application and database using Docker Compose:

```bash
docker-compose up -d
```

## Scripts

- `bun dev`: Starts the application in watch mode.
- `bun run build`: Builds the application.
- `bun start`: Starts the built application.
- `bun run format`: Formats the code using Biome.
- `bun run lint`: Lints the code using Biome.
- `bun run db:generate`: Generates SQL migrations from schema changes.
- `bun run db:migrate`: Applies pending migrations to the database.
- `bun run db:push`: Pushes the schema directly to the database (dev).
- `bun run db:studio`: Opens Drizzle Studio to browse the database.

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger/Scalar UI: `http://localhost:5000/api/docs` (or your configured port)
