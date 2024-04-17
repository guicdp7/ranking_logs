import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { LogProcessorModule } from './modules/logProcessor/log-processor.module';
import { MatchModule } from './modules/match/match.module';
import { resolve } from 'path';

@Module({
  imports: [
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
