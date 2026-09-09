# Tenisu — L’Atelier

Tennis API take-home using NestJS, TypeScript, Prisma, and PostgreSQL.

Prisma and the local database are set up. Player endpoints and statistics are next.
For now, `GET /api` returns `Hello World!`.

## Getting started

You’ll need Node.js 24 and Docker Compose. The API runs locally and PostgreSQL runs
in Docker.

```bash
nvm use
npm ci
cp .env.example .env

docker compose up -d --wait postgres
npm run start:dev
```

Keep your existing `.env` if you already have one. The example credentials are for
local development.

The API runs at `http://localhost:3000/api` and PostgreSQL at `localhost:5433`.
If you change the database settings in `.env`, update `DATABASE_URL` to match.

Swagger docs: [localhost:3000/api/docs](http://localhost:3000/api/docs).

## Checks

```bash
npm run prisma:validate
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

## Stopping the database

```bash
docker compose stop postgres
```

Data stays in a Docker volume. Running `docker compose down -v` deletes it.
