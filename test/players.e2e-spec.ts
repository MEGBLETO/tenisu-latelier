import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PlayerResponseDto } from '../src/players/dto/player-response.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

describe('GET /api/players', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    if (
      !process.env.TEST_DATABASE_URL ||
      process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL
    ) {
      throw new Error('Use npm run test:e2e to start an isolated database.');
    }

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.player.deleteMany();
    await prisma.country.deleteMany();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('orders by rank, then ID when ranks are equal', async () => {
    await prisma.country.create({
      data: { code: 'SRB', picture: 'https://example.com/srb.png' },
    });
    const player = {
      firstname: 'Test',
      lastname: 'Player',
      shortname: 'T.PLA',
      sex: 'M' as const,
      picture: 'https://example.com/player.png',
      countryCode: 'SRB',
      points: 100,
      weight: 80000,
      height: 188,
      age: 31,
      last: [1, 0, 1],
    };
    await prisma.player.createMany({
      data: [
        { ...player, id: 10, rank: 20 },
        { ...player, id: 90, rank: 1 },
        { ...player, id: 30, rank: 5 },
        { ...player, id: 20, rank: 5 },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/players')
      .expect(200)
      .expect('Content-Type', /json/);
    const body = response.body as PlayerResponseDto[];

    expect(body.map((item) => item.id)).toEqual([90, 20, 30, 10]);
    expect(body.map((item) => item.data.rank)).toEqual([1, 5, 5, 20]);
    expect(body[0]).toEqual({
      id: 90,
      firstname: 'Test',
      lastname: 'Player',
      shortname: 'T.PLA',
      sex: 'M',
      picture: 'https://example.com/player.png',
      country: { code: 'SRB', picture: 'https://example.com/srb.png' },
      data: {
        rank: 1,
        points: 100,
        weight: 80000,
        height: 188,
        age: 31,
        last: [1, 0, 1],
      },
    });
  });

  it('returns an empty array when the database has no players', async () => {
    await request(app.getHttpServer())
      .get('/api/players')
      .expect(200)
      .expect([]);
  });
});
