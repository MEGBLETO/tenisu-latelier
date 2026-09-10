import { ApiProperty } from '@nestjs/swagger';
import { PlayerResponseDto } from './player-response.dto';

export class PlayerListResponseDto {
  @ApiProperty({ type: [PlayerResponseDto] })
  players: PlayerResponseDto[];

  @ApiProperty({
    type: 'integer',
    description: 'Number of players matching the search across all pages.',
    example: 5,
  })
  total: number;

  @ApiProperty({ type: 'integer', example: 1 })
  page: number;

  @ApiProperty({ type: 'integer', example: 20 })
  limit: number;
}
