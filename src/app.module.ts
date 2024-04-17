import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { LogProcessorModule } from './modules/logProcessor/log-processor.module';

@Module({
  imports: [LogProcessorModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
