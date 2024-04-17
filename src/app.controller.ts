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

@Controller()
export class AppController {
  constructor(private service: LogProcessorService) {}

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
    this.service.handle(file.buffer).on('data', (data: Buffer) => {
      console.log('data >>', data.toString());
    });
  }
}
