import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/setup-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('serves Swagger at /api/docs', () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/swagger-ui/);
  });

  it('includes the API prefix in the OpenAPI document', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    expect(response.body).toMatchObject({
      info: { title: 'Tenisu — L’Atelier', version: '0.0.1' },
    });
    expect(response.body).toHaveProperty(['paths', '/api', 'get']);
    expect(response.body).toHaveProperty(['paths', '/api/statistics', 'get']);
  });
});
