import {
  BadRequestException,
  Body,
  Post,
  Res,
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreatePlayerDto } from './dto/create-player.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a player by ID' })
  @ApiParam({
    name: 'id',
    schema: { type: 'integer', minimum: 1, maximum: 2147483647 },
    example: 52,
  })
  @ApiOkResponse({ type: PlayerResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid player ID.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Player not found.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PlayerResponseDto> {
    if (id < 1 || id > 2147483647) {
      throw new BadRequestException(
        'Player ID must be between 1 and 2147483647',
      );
    }

    return this.playersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a player' })
  @ApiCreatedResponse({
    type: PlayerResponseDto,
    headers: {
      Location: {
        description: 'URL of the created player.',
        schema: { type: 'string', example: '/api/players/103' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid player data.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  async create(
    @Body() input: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponseDto> {
    const player = await this.playersService.create(input);
    response.location(`/api/players/${player.id}`);
    return player;
  }
}
