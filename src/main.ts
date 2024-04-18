import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';

const logger = new Logger('bootstrap');

async function bootstrap() {
  logger.log('app starting');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const config = app.get(ConfigService);

  const appPort = config.get('APP_PORT', 3000);

  await app.listen(appPort);

  logger.log(`app started on port ${appPort}`);
}
bootstrap();
