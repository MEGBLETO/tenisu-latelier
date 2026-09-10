import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerResponseDto } from './dto/player-response.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PlayerResponseDto[]> {
    const players = await this.prisma.player.findMany({
      orderBy: [{ rank: 'asc' }, { id: 'asc' }],
      include: { country: true },
    });

    return players.map((player) => ({
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
    }));
  }
}
