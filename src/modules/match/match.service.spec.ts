/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'typeorm/platform/PlatformTools';

import { MatchPersistService } from './match-persist.service';
import { MatchSearchService } from './match-search.service';
import { MatchService } from './match.service';

const getFakerLogsStream = (numberOfMatches = 1, numberOfFrags = 10) => {
  const player = () => faker.person.firstName();
  const killedBy = () => faker.person.firstName();
  const weapon = () => faker.word.sample();
  const id = () => faker.number.int().toString();
  const logs = new Readable();
  for (let matchIndex = 0; matchIndex < numberOfMatches; matchIndex++) {
    const matchId = id();
    logs.push(
      `{"type":"match_started","details":{"id":"${matchId}"},"date":"2024-04-18T10:00:00.000Z"}\n`,
    );
    for (let fragIndex = 0; fragIndex < numberOfFrags; fragIndex++) {
      logs.push(
        `{"type":"hit_kill","details":{"player":"${player()}","killedBy":"${killedBy()}","weapon":"${weapon()}"},"date":"2024-04-18T10:01:00.000Z"}\n`,
      );
    }
    logs.push(
      `{"type":"world_kill","details":{"player":"${player()}","weapon":"${weapon()}"},"date":"2024-04-18T10:01:00.000Z"}\n`,
    );
    logs.push(
      `{"type":"match_ended","details":{"id":"${matchId}"},"date":"2024-04-18T10:05:00.000Z"}\n`,
    );
  }
  logs.push(null);
  return logs;
};

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: MatchPersistService,
          useValue: { save: jest.fn((data) => data) },
        },
        { provide: MatchSearchService, useValue: jest.fn() },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importMatchLogs', () => {
    it('should return an array of matches', async () => {
      const data = Buffer.from('log data');
      const result = await service.importMatchLogs(getFakerLogsStream(2));
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });
  });
});
