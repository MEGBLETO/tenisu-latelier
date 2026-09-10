import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PlayersService } from './players.service';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({
    summary: 'List players',
    description: 'Sorted by rank ascending, then ID ascending for ties.',
  })
  @ApiOkResponse({
    description:
      'Players ordered from best to worst. Returns [] when no players exist.',
    type: PlayerResponseDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred.',
    type: ErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description:
      'The database is temporarily unavailable or the request timed out.',
    type: ErrorResponseDto,
  })
  findAll(): Promise<PlayerResponseDto[]> {
    return this.playersService.findAll();
  }
}
