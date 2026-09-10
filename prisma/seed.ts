import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient, Sex } from '../src/generated/prisma/client';
import { players } from './data/players.json';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await prisma.$transaction(async (database) => {
      // Block concurrent inserts until the ID sequence is updated.
      await database.$executeRaw`LOCK TABLE "Country", "Player" IN SHARE ROW EXCLUSIVE MODE`;

      for (const player of players) {
        if (player.sex !== Sex.M && player.sex !== Sex.F) {
          throw new Error(`Invalid sex for player ${player.id}`);
        }
        if (player.data.last.some((result) => result !== 0 && result !== 1)) {
          throw new Error(`Invalid match result for player ${player.id}`);
        }

        await database.country.upsert({
          where: { code: player.country.code },
          update: {},
          create: player.country,
        });

        await database.player.upsert({
          where: { id: player.id },
          update: {},
          create: {
            id: player.id,
            firstname: player.firstname,
            lastname: player.lastname,
            shortname: player.shortname,
            sex: player.sex,
            picture: player.picture,
            countryCode: player.country.code,
            rank: player.data.rank,
            points: player.data.points,
            weight: player.data.weight,
            height: player.data.height,
            age: player.data.age,
            last: player.data.last,
          },
        });
      }

      // Explicit IDs don't advance the sequence. Move it forward only.
      await database.$queryRaw`
        SELECT setval(
          pg_get_serial_sequence('"Player"', 'id'),
          GREATEST(
            (SELECT COALESCE(MAX("id"), 1) FROM "Player"),
            (SELECT last_value FROM "Player_id_seq")
          ),
          true
        )
      `;
    });

    console.log('Seed completed. Existing players were left unchanged.');
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`Seed failed (${error.code}).`);
  } else {
    console.error('Seed failed. Check the data, connection, and migrations.');
  }
  process.exitCode = 1;
});
