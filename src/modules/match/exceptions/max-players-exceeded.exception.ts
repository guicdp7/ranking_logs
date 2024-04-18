import { HttpException, HttpStatus } from '@nestjs/common';

export class MaxPlayersExceededException extends HttpException {
  constructor(maxPlayers = 20) {
    super(
      `the ranking allows matches with up to ${maxPlayers} players`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
