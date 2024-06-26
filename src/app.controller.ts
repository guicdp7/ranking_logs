import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';

import { LogProcessorService } from './modules/logProcessor/log-processor.service';
import { MaxPlayersExceededException } from './modules/match/exceptions/max-players-exceeded.exception';
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
      items: items.map((item) => ({
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
  @Render('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const data = await this.match
      .importMatchLogs(this.processor.handle(file.buffer))
      .catch((e) => e);

    if (data instanceof MaxPlayersExceededException) {
      return {
        status: 'Erro',
        message: 'número máximo de jogadores excedido',
      };
    }
    return {
      status: 'Sucesso',
      message: 'o upload foi realizado com sucesso',
    };
  }

  @Get(':id([0-9]+)')
  @Render('details')
  async details(@Param('id') id: string) {
    const item = await this.match.findOne(Number(id));
    return {
      ...item,
      startedAt: this.formatDate(item.startedAt),
      finishedAt: this.formatDate(item.finishedAt),
      players: item.players.sort((a, b) => (a.ranking > b.ranking ? 1 : -1)),
      logs: item.logs.map((log) => ({
        ...log,
        date: this.formatDate(log.date),
      })),
    };
  }
}
