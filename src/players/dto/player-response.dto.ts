import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty({ example: 'SRB' })
  code: string;

  @ApiProperty({ example: 'https://tenisu.latelier.co/resources/Serbie.png' })
  picture: string;
}

export class PlayerDataResponseDto {
  @ApiProperty({ type: 'integer', example: 2 })
  rank: number;

  @ApiProperty({ type: 'integer', example: 2542 })
  points: number;

  @ApiProperty({
    type: 'integer',
    description: 'Weight in grams',
    example: 80000,
  })
  weight: number;

  @ApiProperty({
    type: 'integer',
    description: 'Height in centimetres',
    example: 188,
  })
  height: number;

  @ApiProperty({ type: 'integer', description: 'Age in years', example: 31 })
  age: number;

  @ApiProperty({
    type: 'array',
    items: { type: 'integer', enum: [0, 1] },
    description: 'Recent match results: 1 is a win, 0 is a loss',
    example: [1, 1, 1, 1, 1],
  })
  last: number[];
}

export class PlayerResponseDto {
  @ApiProperty({ type: 'integer', example: 52 })
  id: number;

  @ApiProperty({ example: 'Novak' })
  firstname: string;

  @ApiProperty({ example: 'Djokovic' })
  lastname: string;

  @ApiProperty({ example: 'N.DJO' })
  shortname: string;

  @ApiProperty({ enum: ['M', 'F'], example: 'M' })
  sex: 'M' | 'F';

  @ApiProperty({ type: CountryResponseDto })
  country: CountryResponseDto;

  @ApiProperty({ example: 'https://tenisu.latelier.co/resources/Djokovic.png' })
  picture: string;

  @ApiProperty({ type: PlayerDataResponseDto })
  data: PlayerDataResponseDto;
}
