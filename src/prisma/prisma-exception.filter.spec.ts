import { INestApplication, Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { Prisma } from '../generated/prisma/client';
import { setupApp } from '../setup-app';
import { PrismaService } from './prisma.service';

describe('Prisma error responses', () => {
  let app: INestApplication<App>;
  let logError: jest.SpyInstance;
  const findMany = jest.fn();
  const privateMessage = 'Private database host, credentials and SQL';

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ player: { findMany } })
      .compile();

    app = module.createNestApplication();
    setupApp(app);
    await app.init();
  });

  beforeEach(() => {
    findMany.mockReset();
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    await app?.close();
  });

  it.each(['P1001', 'P1002', 'P1008', 'P1017', 'P2024', 'P2037'])(
    'returns a safe 503 for %s',
    async (code) => {
      findMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError(privateMessage, {
          code,
          clientVersion: '7.10.0',
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/api/players')
        .expect(503);

      expect(response.body).toEqual({
        statusCode: 503,
        message: 'Service temporarily unavailable',
        error: 'Service Unavailable',
      });
      expect(logError).toHaveBeenCalledWith(`Database request failed: ${code}`);
    },
  );

  it('handles a connection initialization failure during a request', async () => {
    findMany.mockRejectedValue(
      new Prisma.PrismaClientInitializationError(
        privateMessage,
        '7.10.0',
        'P1001',
      ),
    );
    await request(app.getHttpServer()).get('/api/players').expect(503);
  });

  it.each(['P1000', 'P2021'])(
    'keeps configuration and schema errors as 500 (%s)',
    async (code) => {
      findMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError(privateMessage, {
          code,
          clientVersion: '7.10.0',
        }),
      );
      const response = await request(app.getHttpServer())
        .get('/api/players')
        .expect(500);
      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    },
  );

  it('lets Nest handle unexpected errors without exposing their details', async () => {
    findMany.mockRejectedValue(new Error(privateMessage));
    const response = await request(app.getHttpServer())
      .get('/api/players')
      .expect(500);
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('preserves HTTP exceptions', async () => {
    findMany.mockRejectedValue(new NotFoundException('Player not found'));
    const response = await request(app.getHttpServer())
      .get('/api/players')
      .expect(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Player not found',
      error: 'Not Found',
    });
  });

  it('returns an empty list when no players exist', async () => {
    findMany.mockResolvedValue([]);
    await request(app.getHttpServer())
      .get('/api/players')
      .expect(200)
      .expect([]);
  });
});
