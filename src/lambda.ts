import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

type LambdaServer = Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;

let server: LambdaServer;

async function bootstrap(): Promise<LambdaServer> {
  const app: INestApplication = await NestFactory.create(AppModule);
  setupApp(app);
  await app.init();

  const expressApp = app
    .getHttpAdapter()
    .getInstance() as import('express').Express;
  return serverlessExpress<APIGatewayProxyEvent, APIGatewayProxyResult>({
    app: expressApp,
  });
}

export const handler: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult | void
> = async (event, context, callback) => {
  server ??= await bootstrap();
  return server(event, context, callback);
};
