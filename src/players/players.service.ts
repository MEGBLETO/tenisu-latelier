import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerResponseDto } from './dto/player-response.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PlayerResponseDto[]> {
    const players = await this.prisma.player.findMany({
      orderBy: [{ rank: 'asc' }, { id: 'asc' }],
      include: { country: true },
    });

    return players.map((player) => this.toResponse(player));
  }

  async findOne(id: number): Promise<PlayerResponseDto> {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { country: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return this.toResponse(player);
  }

  async create(input: CreatePlayerDto): Promise<PlayerResponseDto> {
    const player = await this.prisma.$transaction(async (transaction) => {
      await transaction.country.upsert({
        where: { code: input.country.code },
        create: { code: input.country.code, picture: input.country.picture },
        update: { code: input.country.code },
      });

      return transaction.player.create({
        data: {
          firstname: input.firstname,
          lastname: input.lastname,
          shortname: input.shortname,
          sex: input.sex,
          picture: input.picture,
          countryCode: input.country.code,
          rank: input.data.rank,
          points: input.data.points,
          weight: input.data.weight,
          height: input.data.height,
          age: input.data.age,
          last: input.data.last,
        },
        include: { country: true },
      });
    });

    return this.toResponse(player);
  }

  private toResponse(
    player: Prisma.PlayerGetPayload<{ include: { country: true } }>,
  ): PlayerResponseDto {
    return {
      id: player.id,
      firstname: player.firstname,
      lastname: player.lastname,
      shortname: player.shortname,
      sex: player.sex,
      country: {
        picture: player.country.picture,
        code: player.country.code,
      },
      picture: player.picture,
      data: {
        rank: player.rank,
        points: player.points,
        weight: player.weight,
        height: player.height,
        age: player.age,
        last: player.last,
      },
    };
  }
}
