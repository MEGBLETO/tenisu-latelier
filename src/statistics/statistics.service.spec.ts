import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  const findMany = jest.fn();
  const player = { countryCode: 'SRB', last: [1], weight: 80000, height: 200 };

  beforeEach(async () => {
    findMany.mockReset();
    const module = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: PrismaService, useValue: { player: { findMany } } },
      ],
    }).compile();
    service = module.get(StatisticsService);
  });

  it('returns null statistics for an empty database', async () => {
    findMany.mockResolvedValue([]);
    expect(await service.getStatistics()).toEqual({
      bestCountry: null,
      averageBmi: null,
      medianHeight: null,
    });
  });

  it('calculates statistics for the supplied players', async () => {
    findMany.mockResolvedValue([
      { countryCode: 'SRB', last: [1, 1, 1, 1, 1], weight: 80000, height: 188 },
      { countryCode: 'USA', last: [0, 1, 0, 0, 1], weight: 74000, height: 185 },
      { countryCode: 'SUI', last: [1, 1, 1, 0, 1], weight: 81000, height: 183 },
      { countryCode: 'USA', last: [0, 1, 1, 1, 0], weight: 72000, height: 175 },
      { countryCode: 'ESP', last: [1, 0, 0, 0, 1], weight: 85000, height: 185 },
    ]);
    expect(await service.getStatistics()).toEqual({
      bestCountry: { code: 'SRB', winRatio: 1 },
      averageBmi: 23.36,
      medianHeight: 185,
    });
  });

  it('averages individual BMIs and the two middle heights for an even count', async () => {
    findMany.mockResolvedValue([
      player,
      { ...player, weight: 90000, height: 150 },
    ]);
    expect(await service.getStatistics()).toEqual({
      bestCountry: { code: 'SRB', winRatio: 1 },
      averageBmi: 30,
      medianHeight: 175,
    });
  });

  it('handles a single player', async () => {
    findMany.mockResolvedValue([player]);
    expect(await service.getStatistics()).toEqual({
      bestCountry: { code: 'SRB', winRatio: 1 },
      averageBmi: 20,
      medianHeight: 200,
    });
  });

  it('uses total matches per country rather than averaging player ratios', async () => {
    findMany.mockResolvedValue([
      { ...player, countryCode: 'USA', last: [1] },
      { ...player, countryCode: 'USA', last: [0, 0, 0, 0] },
      { ...player, countryCode: 'SRB', last: [1, 0, 0] },
    ]);
    expect((await service.getStatistics()).bestCountry).toEqual({
      code: 'SRB',
      winRatio: 0.33,
    });
  });

  it.each([
    ['USA', 'ESP'],
    ['ESP', 'USA'],
  ])(
    'breaks ties alphabetically with input %s then %s',
    async (first, second) => {
      findMany.mockResolvedValue([
        { ...player, countryCode: first },
        { ...player, countryCode: second },
      ]);
      expect((await service.getStatistics()).bestCountry?.code).toBe('ESP');
    },
  );

  it('selects the winner before rounding ratios', async () => {
    findMany.mockResolvedValue([
      {
        ...player,
        countryCode: 'ESP',
        last: [1, ...Array<number>(200).fill(0)],
      },
      {
        ...player,
        countryCode: 'USA',
        last: [1, ...Array<number>(199).fill(0)],
      },
    ]);
    expect((await service.getStatistics()).bestCountry).toEqual({
      code: 'USA',
      winRatio: 0.01,
    });
  });

  it('excludes countries without matches while retaining zero-win countries', async () => {
    findMany.mockResolvedValue([
      { ...player, countryCode: 'ESP', last: [] },
      { ...player, last: [0] },
    ]);
    expect((await service.getStatistics()).bestCountry).toEqual({
      code: 'SRB',
      winRatio: 0,
    });
  });

  it('still calculates BMI and height when nobody has match history', async () => {
    findMany.mockResolvedValue([{ ...player, last: [] }]);
    expect(await service.getStatistics()).toEqual({
      bestCountry: null,
      averageBmi: 20,
      medianHeight: 200,
    });
  });
});
