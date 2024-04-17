import {
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';

import { LogProcessorService } from './modules/logProcessor/log-processor.service';
import { MatchService } from './modules/match/match.service';

@Controller()
export class AppController {
  constructor(
    private processor: LogProcessorService,
    private match: MatchService,
  ) {}

  @Get()
  @Render('index')
  index() {
    return {};
  }

  @Get('import')
  @Render('import')
  import() {
    return {};
  }

  @Post('upload')
  @Redirect('/')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    this.match.convertLogsToMatches(this.processor.handle(file.buffer));
  }
}
