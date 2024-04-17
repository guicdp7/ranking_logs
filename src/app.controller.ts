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

  private formatDate(date: Date) {
    const obj = new Date(date);
    const year = obj.getFullYear();

    let day: any = obj.getDate();
    day = day < 10 ? `0${day}` : day;

    let month: any = obj.getMonth();
    month = month < 10 ? `0${month}` : month;

    let hour: any = obj.getHours();
    hour = hour < 10 ? `0${hour}` : hour;

    let minutes: any = obj.getMinutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${day}/${month}/${year} às ${hour}:${minutes}`;
  }

  @Get()
  @Render('index')
  async index() {
    const items = await this.match.findAll();
    return {
      items: (items as any).map((item) => ({
        ...item,
        startedAt: this.formatDate(item.startedAt),
      })),
    };
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
    this.match.importMatchLogs(this.processor.handle(file.buffer));
  }
}
