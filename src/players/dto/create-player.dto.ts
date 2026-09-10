import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsObject,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'SRB', pattern: '^[A-Z]{3}$' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  code: string;

  @ApiProperty({ example: 'https://tenisu.latelier.co/resources/Serbie.png' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  picture: string;
}

export class CreatePlayerDataDto {
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 2147483647, example: 2 })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  rank: number;

  @ApiProperty({
    type: 'integer',
    minimum: 0,
    maximum: 2147483647,
    example: 2542,
  })
  @IsInt()
  @Min(0)
  @Max(2147483647)
  points: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 2147483647,
    example: 80000,
    description: 'Weight in grams',
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  weight: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 2147483647,
    example: 188,
    description: 'Height in centimetres',
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  height: number;

  @ApiProperty({
    type: 'integer',
    minimum: 0,
    maximum: 2147483647,
    example: 31,
  })
  @IsInt()
  @Min(0)
  @Max(2147483647)
  age: number;

  @ApiProperty({
    type: 'array',
    items: { type: 'integer', enum: [0, 1] },
    example: [1, 1, 1, 1, 1],
    description: 'Recent match results. An empty array is allowed.',
  })
  @IsArray()
  @IsIn([0, 1], { each: true })
  last: number[];
}

export class CreatePlayerDto {
  @ApiProperty({ example: 'Novak' })
  @IsString()
  @Matches(/\S/, { message: 'firstname must not be blank' })
  firstname: string;

  @ApiProperty({ example: 'Djokovic' })
  @IsString()
  @Matches(/\S/, { message: 'lastname must not be blank' })
  lastname: string;

  @ApiProperty({ example: 'N.DJO' })
  @IsString()
  @Matches(/\S/, { message: 'shortname must not be blank' })
  shortname: string;

  @ApiProperty({ enum: ['M', 'F'], example: 'M' })
  @IsIn(['M', 'F'])
  sex: 'M' | 'F';

  @ApiProperty({ example: 'https://tenisu.latelier.co/resources/Djokovic.png' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  picture: string;

  @ApiProperty({ type: CreateCountryDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCountryDto)
  country: CreateCountryDto;

  @ApiProperty({ type: CreatePlayerDataDto })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePlayerDataDto)
  data: CreatePlayerDataDto;
}
