import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Tenisu — L’Atelier')
    .setDescription('Tennis players and statistics API.')
    .setVersion('0.0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    useGlobalPrefix: true,
  });
}
