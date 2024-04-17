import { HttpException, HttpStatus } from '@nestjs/common';

export class MaxPlayersExceededException extends HttpException {
  constructor() {
    super(
      'the ranking allows matches with up to 20 players',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
