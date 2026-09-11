import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Tenisu — L’Atelier')
    .setDescription('Tennis players and statistics API.')
    .setVersion('0.0.1');
  const apiStage = process.env.AWS_LAMBDA_FUNCTION_NAME ? 'Prod' : undefined;
  if (apiStage) {
    config.addServer(`/${apiStage}`);
  }
  const documentConfig = config.build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, documentFactory, {
    useGlobalPrefix: true,
  });
}
