# NestJS Fastify Boilerplate

A high-performance boilerplate application built with [NestJS](https://nestjs.com/) and [Fastify](https://www.fastify.io/), using [Bun](https://bun.sh/) as the runtime.

## Features

- **Runtime**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.
- **Framework**: [NestJS](https://nestjs.com/) (v11) - A progressive Node.js framework for building efficient, scalable Node.js server-side applications.
- **HTTP Adapter**: [Fastify](https://www.fastify.io/) - High performance and low overhead web framework.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/) (v7), using the Bun-optimized `prisma-client` generator (`runtime = "bun"`, `engineType = "client"` — no Rust query engine, so `bun build --compile` keeps working) and the [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/overview/databases/postgresql) driver adapter.
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
    Update the `.env` file with your configuration. At minimum set `PG_URL` (append TLS params such as `?sslmode=require` to the URL if your database requires it).

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

## Database (Prisma ORM)

The schema lives in `prisma/schema.prisma`. The Migrate/CLI connection URL is read in `prisma.config.ts` (Prisma 7 no longer allows `url` in the schema's `datasource` block); it picks up `PG_URL` from your `.env` (include any TLS params like `?sslmode=require` directly in the URL). After editing the schema, regenerate the client and apply changes:

```bash
bun run db:generate   # regenerate the typed client into src/generated/prisma
bun run db:migrate    # create + apply a migration in ./prisma/migrations (dev)
bun run db:deploy     # apply pending migrations (CI / production)
bun run db:push       # alternatively, push the schema directly (handy in dev)
bun run db:studio     # browse the database in Prisma Studio
```

> The generated client (`src/generated/prisma/`) is git-ignored and regenerated automatically on `bun install` via the `postinstall` script.

`PrismaService` (`src/database/prisma.service.ts`) extends `PrismaClient` and is exported app-wide by the global `PrismaModule`. Inject it into any service and call Prisma methods directly:

```ts
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class SomeService {
	constructor(private readonly prisma: PrismaService) {}

	findUsers() {
		return this.prisma.user.findMany();
	}
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
- `bun run db:generate`: Regenerates the typed Prisma client.
- `bun run db:migrate`: Creates and applies a migration (dev).
- `bun run db:deploy`: Applies pending migrations (CI / production).
- `bun run db:push`: Pushes the schema directly to the database (dev).
- `bun run db:studio`: Opens Prisma Studio to browse the database.

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger/Scalar UI: `http://localhost:5000/api/docs` (or your configured port)
