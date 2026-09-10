import { Test } from '@nestjs/testing';
import { Sex } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlayersService } from './players.service';

describe('PlayersService', () => {
  let service: PlayersService;
  const findMany = jest.fn();

  beforeEach(async () => {
    findMany.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        PlayersService,
        { provide: PrismaService, useValue: { player: { findMany } } },
      ],
    }).compile();
    service = module.get(PlayersService);
  });

  it('maps database fields into the public player response', async () => {
    findMany.mockResolvedValue([
      {
        id: 52,
        firstname: 'Novak',
        lastname: 'Djokovic',
        shortname: 'N.DJO',
        sex: Sex.M,
        picture: 'https://example.com/djokovic.png',
        countryCode: 'SRB',
        country: { code: 'SRB', picture: 'https://example.com/srb.png' },
        rank: 2,
        points: 2542,
        weight: 80000,
        height: 188,
        age: 31,
        last: [1, 1, 1, 1, 1],
      },
    ]);

    expect(await service.findAll()).toEqual([
      {
        id: 52,
        firstname: 'Novak',
        lastname: 'Djokovic',
        shortname: 'N.DJO',
        sex: 'M',
        picture: 'https://example.com/djokovic.png',
        country: { code: 'SRB', picture: 'https://example.com/srb.png' },
        data: {
          rank: 2,
          points: 2542,
          weight: 80000,
          height: 188,
          age: 31,
          last: [1, 1, 1, 1, 1],
        },
      },
    ]);
  });

  it('returns an empty array when there are no players', async () => {
    findMany.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
  });
});
