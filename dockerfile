FROM oven/bun:1 AS deps

WORKDIR /app

# Skip husky git hooks during container install
ENV HUSKY=0

# Prisma schema + config must be present before install,
# since `postinstall` runs `prisma generate`.
COPY tsconfig.json package.json bun.lock prisma.config.ts ./
COPY ./prisma ./prisma
COPY ./src ./src
COPY ./scripts ./scripts

# Full install (the prisma CLI is a devDependency needed to generate the
# client). The final artifact is a standalone compiled binary, so this
# stage's node_modules is discarded anyway.
RUN bun install --frozen-lockfile

# Generate the Prisma client and compile the standalone server binary.
RUN bun run db:generate
RUN bun run build

FROM gcr.io/distroless/base AS runner

WORKDIR /app

# The compiled binary is fully self-contained and already executable.
COPY --from=deps /app/dist/server ./server

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["./server"]
