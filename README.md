# Tenisu — L’Atelier

Tennis API take-home using NestJS, TypeScript, Prisma, and PostgreSQL.

`GET /api/players` returns players ordered by rank, then ID for ties.
Player lookup, creation, and statistics are still to come.

## Getting started

You’ll need Node.js 24 and a Neon PostgreSQL database. The API runs locally and
connects to Neon.

```bash
nvm use
npm ci
cp .env.example .env
```

Keep your existing `.env` if you already have one. In the Neon console, open
**Connect**, enable **Connection pooling**, and copy the PostgreSQL connection
string into `DATABASE_URL` in `.env`, keeping its SSL parameters. The values in
`.env.example` are placeholders.

```bash
npx prisma migrate deploy
npm run prisma:generate
npx prisma db seed
npm run start:dev
```

The API runs at `http://localhost:3000/api`.

Swagger docs: [localhost:3000/api/docs](http://localhost:3000/api/docs).

## Checks

```bash
npm run prisma:validate
npm run build
npm run lint:check
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

The unit and mocked HTTP tests run without a database. End-to-end tests require
Docker: the command starts a temporary PostgreSQL database, applies migrations,
and removes it afterward. It does not use the Neon database.

GitHub Actions runs these checks on every push and pull request. No Neon secrets
are needed.
