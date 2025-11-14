FROM oven/bun:1 AS deps

WORKDIR /app

COPY tsconfig.json package.json bun.lock ./
COPY ./src ./src
COPY ./scripts ./scripts

RUN bun install --frozen-lockfile --production
RUN bun run build

FROM gcr.io/distroless/base AS runner

WORKDIR /app

COPY --from=deps --chown=nest:nodejs /app/dist/server ./server
RUN chmod +x ./server

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["./server"]
