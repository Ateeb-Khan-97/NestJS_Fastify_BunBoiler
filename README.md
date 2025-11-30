# NestJS Fastify Boilerplate

A high-performance boilerplate application built with [NestJS](https://nestjs.com/) and [Fastify](https://www.fastify.io/), using [Bun](https://bun.sh/) as the runtime.

## Features

- **Runtime**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.
- **Framework**: [NestJS](https://nestjs.com/) (v11) - A progressive Node.js framework for building efficient, scalable Node.js server-side applications.
- **HTTP Adapter**: [Fastify](https://www.fastify.io/) - High performance and low overhead web framework.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/).
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
    Update the `.env` file with your configuration.

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

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger/Scalar UI: `http://localhost:5000/api/docs` (or your configured port)
