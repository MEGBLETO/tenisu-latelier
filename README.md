# Tenisu — L’Atelier

Tennis API take-home using NestJS, TypeScript, Prisma, and PostgreSQL.

## API

- `GET /api/players?page=1&limit=20&search=novak` lists players ordered by rank,
  then ID for ties. Search is case-insensitive and matches first or last names.
  The response includes `players`, `total`, `page`, and `limit`.
- `GET /api/players/:id` returns one player. Invalid IDs return `400`; unknown
  players return `404`.
- `GET /api/statistics` returns the best country win ratio, average BMI, and median
  height.
- `POST /api/players` creates a player and returns `201` with a `Location` header.
- `GET /api/health` checks the API and database connection, returning `503` when
  the database is unavailable.

Requests reject unknown fields and invalid values. Names cannot be blank, URLs must
use HTTP or HTTPS, country codes must be three uppercase letters, and match history
can contain only `0` and `1`. Rank, weight, and height must be positive integers;
points and age may be zero. Existing countries keep their stored picture.

Statistics use the recent match results in `last`. Country ratios are total wins
divided by total matches, with alphabetical tie-breaking. BMI uses kilograms and
metres, and height is returned in centimetres. Values are rounded to two decimals;
empty data returns `null` values.

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

Deployed API:

- Swagger: https://pctjenmmwk.execute-api.eu-north-1.amazonaws.com/Prod/api/docs
- Health: https://pctjenmmwk.execute-api.eu-north-1.amazonaws.com/Prod/api/health

The AWS deployment uses a Lambda function behind API Gateway and a Neon PostgreSQL
database. The `DATABASE_URL` value is supplied at deployment time and is not stored
in the repository.

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
