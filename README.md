# Tenisu — L’Atelier

Tennis API take-home using NestJS, TypeScript, Prisma, and PostgreSQL.

`GET /api/players?page=1&limit=20&search=novak` returns players ordered by rank,
then ID for ties. The response contains `players`, `total`, `page`, and `limit`.
Page defaults to 1 and limit to 20 (maximum 100). Optional search matches part of
either first or last name, ignoring case and surrounding whitespace. `total` counts
all matching players. Pages beyond the results return an empty `players` array.
`GET /api/players/:id` returns a player, or 404 if the player does not exist.
Invalid IDs return 400.
`GET /api/statistics` returns the best country win ratio, average BMI, and median height.
`POST /api/players` accepts the same player structure without `id` and returns
201 with the created player and a `Location` header. All fields are required;
unknown fields are rejected. Names must not be blank, URLs must use HTTP or HTTPS,
and country codes must contain three uppercase letters. Rank, weight, and height
must be positive integers; points and age can be zero. Match history accepts only
0 and 1, including an empty array. Integers are limited to 2147483647.
Existing countries keep their stored picture; new countries are created with the player.

Statistics use recent match results (`last`). Country ratios use total wins divided
by total matches, with ties resolved alphabetically by country code. Countries
without matches are excluded. BMI is averaged per player using kilograms and metres;
height is returned in centimetres. BMI and win ratio are rounded to two decimals
after calculation. An empty database returns null for all three fields; no match
history returns null for the best country.

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
