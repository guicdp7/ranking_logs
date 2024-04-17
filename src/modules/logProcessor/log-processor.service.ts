import { Injectable } from '@nestjs/common';
import { createInterface } from 'readline';
import { Readable, Transform, TransformCallback } from 'stream';

import { LOG_FORMATS } from './log-processor.constants';
import { LogLine } from './log-processor.interfaces';

@Injectable()
export class LogProcessorService {
  handle(data: Buffer) {
    const logLines = createInterface(Readable.from(data));
    return Readable.from(logLines).pipe(this.convertToLogLineObject());
  }

  private getLogDate(text: string) {
    const parts = text.split(' ');
    const dateFields = parts[0].split('/');
    return new Date(
      `${dateFields[2]}-${dateFields[1]}-${dateFields[0]}T${parts[1]}`,
    );
  }

  private getLogType(text: string): (typeof LOG_FORMATS)[number] {
    return LOG_FORMATS.find((item) => item.rule.test(text));
  }

  private convertToLogLineObject() {
    return new Transform({
      transform: (
        chunk: Buffer,
        encoding: string,
        callback: TransformCallback,
      ) => {
        const text = chunk.toString();
        if (!text || !text.length) {
          callback(undefined, undefined);
          return;
        }
        const logLineObj: Partial<LogLine> = {};
        const logParts = text.split(' - ');

        logLineObj.date = this.getLogDate(logParts[0]);
        logLineObj.type = this.getLogType(logParts[1])?.name ?? 'unknown';

        callback(undefined, JSON.stringify(logLineObj));
      },
    });
  }
}
