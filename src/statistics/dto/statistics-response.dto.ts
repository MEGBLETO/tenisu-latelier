import { ApiProperty } from '@nestjs/swagger';

export class BestCountryResponseDto {
  @ApiProperty({ example: 'SRB' })
  code: string;

  @ApiProperty({ minimum: 0, maximum: 1, example: 1 })
  winRatio: number;
}

export class StatisticsResponseDto {
  @ApiProperty({
    type: BestCountryResponseDto,
    nullable: true,
    description:
      'Wins divided by matches per country. Ties use country code alphabetically. Null when no matches exist.',
  })
  bestCountry: BestCountryResponseDto | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 23.36,
    description:
      'Mean of individual BMIs in kg/m², rounded to two decimals. Null when no players exist.',
  })
  averageBmi: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 185,
    description: 'Median height in centimetres. Null when no players exist.',
  })
  medianHeight: number | null;
}
