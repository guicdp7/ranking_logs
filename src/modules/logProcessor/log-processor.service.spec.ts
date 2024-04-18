/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { LogProcessorService } from './log-processor.service';

const getStreamData = (stream: any): Promise<any[]> => {
  return new Promise((resolve) => {
    const items: any = [];
    stream.on('data', (item: Buffer) =>
      items.push(JSON.parse(item.toString())),
    );
    stream.on('finish', () => resolve(items));
  }) as any;
};

describe('LogProcessorService', () => {
  let service: LogProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogProcessorService],
    }).compile();

    service = module.get<LogProcessorService>(LogProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('should return a readable stream', () => {
      const data = Buffer.from('log data');
      const result = service.handle(data);
      expect(result).toBeDefined();
      expect(result.readable).toBeTruthy();
    });
  });

  describe('convertToLogLineObject', () => {
    it('should parse log lines to JSON objects', async () => {
      const player = () => faker.person.firstName();
      const killedBy = () => faker.person.firstName();
      const weapon = () => faker.word.sample();
      const id = faker.number.int().toString();
      const data = Buffer.from(
        `
        18/04/2024 12:00:00 - New Match ${id} has started
        18/04/2024 12:00:10 - ${killedBy()} killed ${player()} using ${weapon()}
        18/04/2024 12:00:34 - ${killedBy()} killed ${player()} using ${weapon()}
        18/04/2024 12:01:02 - ${killedBy()} killed ${player()} using ${weapon()}
        18/04/2024 12:06:22 - ${killedBy()} killed ${player()} using ${weapon()}
        18/04/2024 12:09:11 - ${killedBy()} killed ${player()} using ${weapon()}
        18/04/2024 12:10:32 - <WORLD> killed ${player()} by ${weapon()}
        18/04/2024 12:11:26 - Match ${id} has ended
        `,
      );
      const stream = service.handle(data);
      const result: any[] = await getStreamData(stream);
      expect(result).toBeDefined();
      expect(result.length).toBe(8);
      expect(typeof result[0]).toBe('object');
      expect(result[0].type).toBe('match_started');
      expect(result[0].details.id).toBe(id);
      expect(result[0].date).toBeDefined();
    });
    it('should parse log type match_started', async () => {
      const id = faker.number.int().toString();
      const data = Buffer.from(
        `18/04/2024 12:00:00 - New Match ${id} has started`,
      );
      const stream = service.handle(data);
      const result: any[] = await getStreamData(stream);
      expect(result[0].type).toBe('match_started');
      expect(result[0].details.id).toBe(id);
    });
    it('should parse log type match_ended', async () => {
      const id = faker.number.int().toString();
      const data = Buffer.from(`18/04/2024 12:00:00 - Match ${id} has ended`);
      const stream = service.handle(data);
      const result: any[] = await getStreamData(stream);
      expect(result[0].type).toBe('match_ended');
      expect(result[0].details.id).toBe(id);
    });
    it('should parse log type world_kill', async () => {
      const player = faker.person.firstName();
      const weapon = faker.word.sample();
      const data = Buffer.from(
        `18/04/2024 12:00:00 - <WORLD> killed ${player} by ${weapon}`,
      );
      const stream = service.handle(data);
      const result: any[] = await getStreamData(stream);
      expect(result[0].type).toBe('world_kill');
      expect(result[0].details.player).toBe(player);
      expect(result[0].details.weapon).toBe(weapon);
    });
    it('should parse log type hit_kill', async () => {
      const player = faker.person.firstName();
      const killedBy = faker.person.firstName();
      const weapon = faker.word.sample();
      const data = Buffer.from(
        `18/04/2024 12:00:00 - ${killedBy} killed ${player} using ${weapon}`,
      );
      const stream = service.handle(data);
      const result: any[] = await getStreamData(stream);
      expect(result[0].type).toBe('hit_kill');
      expect(result[0].details.killedBy).toBe(killedBy);
      expect(result[0].details.player).toBe(player);
      expect(result[0].details.weapon).toBe(weapon);
    });
  });
});
