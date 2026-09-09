# Tenisu — L’Atelier

Tennis API take-home using NestJS, TypeScript, Prisma, and PostgreSQL.

Prisma and the Neon PostgreSQL connection are set up. Player endpoints and statistics are next.
For now, `GET /api` returns `Hello World!`.

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
npm run start:dev
```

The API runs at `http://localhost:3000/api`.

Swagger docs: [localhost:3000/api/docs](http://localhost:3000/api/docs).

## Checks

```bash
npm run prisma:validate
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```
