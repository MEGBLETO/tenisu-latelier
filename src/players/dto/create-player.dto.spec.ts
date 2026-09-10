import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setupApp } from '../../setup-app';
import { CreatePlayerDto } from './create-player.dto';

@Controller('validation-test')
class ValidationTestController {
  @Post()
  validate(@Body() player: CreatePlayerDto): CreatePlayerDto {
    return player;
  }
}

describe('CreatePlayerDto validation', () => {
  let app: INestApplication<App>;
  const player = {
    firstname: 'Novak',
    lastname: 'Djokovic',
    shortname: 'N.DJO',
    sex: 'M',
    picture: 'https://example.com/player.png',
    country: { code: 'SRB', picture: 'https://example.com/country.png' },
    data: {
      rank: 2,
      points: 2542,
      weight: 80000,
      height: 188,
      age: 31,
      last: [1, 0, 1],
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ValidationTestController],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('accepts a complete player', async () => {
    await request(app.getHttpServer())
      .post('/api/validation-test')
      .send(player)
      .expect(201)
      .expect(player);
  });

  it('allows empty match history and zero points and age', async () => {
    const body = {
      ...player,
      data: { ...player.data, last: [], points: 0, age: 0 },
    };
    await request(app.getHttpServer())
      .post('/api/validation-test')
      .send(body)
      .expect(201)
      .expect(body);
  });

  it.each([
    'firstname',
    'lastname',
    'shortname',
    'sex',
    'picture',
    'country',
    'data',
  ])('requires %s', async (field) => {
    const body: Record<string, unknown> = { ...player };
    delete body[field];
    await request(app.getHttpServer())
      .post('/api/validation-test')
      .send(body)
      .expect(400);
  });

  it.each(['rank', 'points', 'weight', 'height', 'age', 'last'])(
    'requires data.%s',
    async (field) => {
      const data: Record<string, unknown> = { ...player.data };
      delete data[field];
      await request(app.getHttpServer())
        .post('/api/validation-test')
        .send({ ...player, data })
        .expect(400);
    },
  );

  it.each([
    { firstname: '' },
    { lastname: '   ' },
    { shortname: 42 },
    { sex: 'X' },
    { picture: 'ftp://example.com/player.png' },
    { picture: 'example.com/player.png' },
    { id: 52 },
    { unexpected: true },
    { country: null },
    { country: [] },
    { country: {} },
    { country: { ...player.country, code: 'srb' } },
    { country: { ...player.country, code: 'US' } },
    { country: { ...player.country, picture: 'invalid' } },
    { country: { ...player.country, extra: true } },
    { data: null },
    { data: [] },
  ])('rejects invalid player fields: %j', async (changes) => {
    const response = await request(app.getHttpServer())
      .post('/api/validation-test')
      .send({ ...player, ...changes })
      .expect(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  it.each([
    { rank: 0 },
    { weight: -1 },
    { height: 0 },
    { points: -1 },
    { age: -1 },
    { rank: 1.5 },
    { height: '188' },
    { points: 2147483648 },
    { last: [0, 2] },
    { last: ['1'] },
    { last: [true] },
    { last: 1 },
    { last: null },
    { extra: true },
  ])('rejects invalid player data: %j', async (changes) => {
    await request(app.getHttpServer())
      .post('/api/validation-test')
      .send({ ...player, data: { ...player.data, ...changes } })
      .expect(400);
  });
});
