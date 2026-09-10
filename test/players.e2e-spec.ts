import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PlayerListResponseDto } from '../src/players/dto/player-list-response.dto';
import { CreatePlayerDto } from '../src/players/dto/create-player.dto';
import { PlayerResponseDto } from '../src/players/dto/player-response.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

describe('Players endpoints', () => {
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
    const page = response.body as PlayerListResponseDto;
    expect(page).toMatchObject({ total: 4, page: 1, limit: 20 });
    const body = page.players;

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
      .expect({ players: [], total: 0, page: 1, limit: 20 });
  });

  it('returns the player matching the requested ID', async () => {
    await prisma.country.create({
      data: { code: 'SRB', picture: 'https://example.com/srb.png' },
    });
    await prisma.player.create({
      data: {
        id: 52,
        firstname: 'Novak',
        lastname: 'Djokovic',
        shortname: 'N.DJO',
        sex: 'M',
        picture: 'https://example.com/djokovic.png',
        countryCode: 'SRB',
        rank: 2,
        points: 2542,
        weight: 80000,
        height: 188,
        age: 31,
        last: [1, 1, 1, 1, 1],
      },
    });

    await request(app.getHttpServer())
      .get('/api/players/52')
      .expect(200)
      .expect({
        id: 52,
        firstname: 'Novak',
        lastname: 'Djokovic',
        shortname: 'N.DJO',
        sex: 'M',
        picture: 'https://example.com/djokovic.png',
        country: { code: 'SRB', picture: 'https://example.com/srb.png' },
        data: {
          rank: 2,
          points: 2542,
          weight: 80000,
          height: 188,
          age: 31,
          last: [1, 1, 1, 1, 1],
        },
      });
    await request(app.getHttpServer())
      .get('/api/players/53')
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Player not found',
        error: 'Not Found',
      });
  });

  it.each(['abc', '1.5', '0', '-1', '2147483648', '9007199254740993'])(
    'rejects invalid player ID %s',
    async (id) => {
      const response = await request(app.getHttpServer())
        .get(`/api/players/${id}`)
        .expect(400);
      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
    },
  );

  it('returns empty statistics when there are no players', async () => {
    await request(app.getHttpServer())
      .get('/api/statistics')
      .expect(200)
      .expect({
        bestCountry: null,
        averageBmi: null,
        medianHeight: null,
      });
  });

  it('reports API and database availability', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('calculates statistics from stored players', async () => {
    await prisma.country.create({
      data: { code: 'SRB', picture: 'https://example.com/srb.png' },
    });
    await prisma.player.create({
      data: {
        firstname: 'Test',
        lastname: 'Player',
        shortname: 'T.PLA',
        sex: 'M',
        picture: 'https://example.com/player.png',
        countryCode: 'SRB',
        rank: 1,
        points: 100,
        weight: 80000,
        height: 200,
        age: 30,
        last: [1, 0, 1],
      },
    });
    await request(app.getHttpServer())
      .get('/api/statistics')
      .expect(200)
      .expect({
        bestCountry: { code: 'SRB', winRatio: 0.67 },
        averageBmi: 20,
        medianHeight: 200,
      });
  });

  describe('POST /api/players', () => {
    const input: CreatePlayerDto = {
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
        height: 200,
        age: 30,
        last: [1, 0, 1],
      },
    };

    it('creates a player and country, and returns a working Location', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/players')
        .send(input)
        .expect(201);
      const player = response.body as PlayerResponseDto;
      expect(Number.isInteger(player.id)).toBe(true);
      expect(player.id).toBeGreaterThan(0);
      expect(player).toEqual({ ...input, id: player.id });
      expect(response.headers.location).toBe(`/api/players/${player.id}`);
      await request(app.getHttpServer())
        .get(`/api/players/${player.id}`)
        .expect(200)
        .expect(player);
      await request(app.getHttpServer())
        .get('/api/players')
        .expect(200)
        .expect({ players: [player], total: 1, page: 1, limit: 20 });
      await request(app.getHttpServer())
        .get('/api/statistics')
        .expect(200)
        .expect({
          bestCountry: { code: 'SRB', winRatio: 0.67 },
          averageBmi: 20,
          medianHeight: 200,
        });
    });

    it('reuses the country without changing its picture', async () => {
      const country = {
        code: 'SRB',
        picture: 'https://example.com/original.png',
      };
      await prisma.country.create({ data: country });
      const response = await request(app.getHttpServer())
        .post('/api/players')
        .send(input)
        .expect(201);
      const player = response.body as PlayerResponseDto;
      expect(player.country).toEqual(country);
      expect(await prisma.country.findMany()).toEqual([country]);
    });

    it('supports simultaneous player creations for a new country', async () => {
      const responses = await Promise.all([
        request(app.getHttpServer())
          .post('/api/players')
          .send(input)
          .expect(201),
        request(app.getHttpServer())
          .post('/api/players')
          .send({ ...input, firstname: 'Another' })
          .expect(201),
      ]);
      const first = responses[0].body as PlayerResponseDto;
      const second = responses[1].body as PlayerResponseDto;
      expect(first.id).not.toBe(second.id);
      expect(await prisma.player.count()).toBe(2);
      expect(await prisma.country.count()).toBe(1);
    });

    it.each([
      { id: 52 },
      { data: { ...input.data, height: 0 } },
      { country: { ...input.country, extra: true } },
    ])(
      'rejects invalid input without writing to the database: %j',
      async (changes) => {
        const response = await request(app.getHttpServer())
          .post('/api/players')
          .send({ ...input, ...changes })
          .expect(400);
        expect(
          Array.isArray((response.body as { message: unknown }).message),
        ).toBe(true);
        expect(await prisma.player.count()).toBe(0);
        expect(await prisma.country.count()).toBe(0);
      },
    );
  });

  describe('pagination and name search', () => {
    beforeEach(async () => {
      await prisma.country.create({
        data: { code: 'USA', picture: 'https://example.com/usa.png' },
      });
      const player = {
        shortname: 'T.PLA',
        sex: 'F' as const,
        picture: 'https://example.com/player.png',
        countryCode: 'USA',
        points: 100,
        weight: 70000,
        height: 180,
        age: 30,
        last: [],
      };
      await prisma.player.createMany({
        data: [
          {
            ...player,
            id: 95,
            firstname: 'Venus',
            lastname: 'Williams',
            rank: 52,
          },
          {
            ...player,
            id: 102,
            firstname: 'Serena',
            lastname: 'Williams',
            rank: 10,
          },
          {
            ...player,
            id: 17,
            firstname: 'Rafael',
            lastname: 'Nadal',
            rank: 1,
          },
          {
            ...player,
            id: 52,
            firstname: 'Novak',
            lastname: 'Djokovic',
            rank: 10,
          },
        ],
      });
    });

    it('returns consecutive pages in ranking and ID order', async () => {
      const first = await request(app.getHttpServer())
        .get('/api/players?page=1&limit=2')
        .expect(200);
      const second = await request(app.getHttpServer())
        .get('/api/players?page=2&limit=2')
        .expect(200);
      expect(
        (first.body as PlayerListResponseDto).players.map(
          (player) => player.id,
        ),
      ).toEqual([17, 52]);
      expect(
        (second.body as PlayerListResponseDto).players.map(
          (player) => player.id,
        ),
      ).toEqual([102, 95]);
      expect(first.body).toMatchObject({ total: 4, page: 1, limit: 2 });
      expect(second.body).toMatchObject({ total: 4, page: 2, limit: 2 });
    });

    it('paginates a case-insensitive surname search with a filtered total', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/players')
        .query({ search: '  wILL  ', page: 2, limit: 1 })
        .expect(200);
      expect(response.body).toMatchObject({ total: 2, page: 2, limit: 1 });
      expect(
        (response.body as PlayerListResponseDto).players.map(
          (player) => player.id,
        ),
      ).toEqual([95]);
    });

    it('matches a partial first name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/players?search=OVA')
        .expect(200);
      expect(response.body).toMatchObject({ total: 1 });
      expect(
        (response.body as PlayerListResponseDto).players.map(
          (player) => player.id,
        ),
      ).toEqual([52]);
    });

    it('returns an empty page beyond the results without losing the total', async () => {
      await request(app.getHttpServer())
        .get('/api/players?page=3&limit=2')
        .expect(200)
        .expect({ players: [], total: 4, page: 3, limit: 2 });
    });

    it.each(['missing', '%', '_', '\\'])(
      'returns no matches for %s',
      async (search) => {
        await request(app.getHttpServer())
          .get('/api/players')
          .query({ search })
          .expect(200)
          .expect({ players: [], total: 0, page: 1, limit: 20 });
      },
    );

    it('treats whitespace-only search as no filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/players')
        .query({ search: '  ' })
        .expect(200);
      expect(response.body).toMatchObject({ total: 4, page: 1, limit: 20 });
    });
  });

  it.each([
    'page=0',
    'page=-1',
    'page=1.5',
    'page=abc',
    'page=2147483648',
    'page=2147483647&limit=100',
    'limit=0',
    'limit=101',
    'limit=1.5',
    'limit=abc',
    'page=1&page=2',
    'search=a&search=b',
    'unexpected=true',
  ])('rejects invalid list parameters: %s', async (query) => {
    await request(app.getHttpServer()).get(`/api/players?${query}`).expect(400);
  });
});
