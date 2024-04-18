import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';

import { AppController } from './app.controller';
import { LogProcessorModule } from './modules/logProcessor/log-processor.module';
import { MatchModule } from './modules/match/match.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LogProcessorModule,
    MatchModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/sql',
      synchronize: true,
      entities: [
        resolve(__dirname, 'modules', '**', 'entities', '*.entity.{ts,js}'),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
