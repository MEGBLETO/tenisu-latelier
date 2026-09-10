import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BestCountryResponseDto,
  StatisticsResponseDto,
} from './dto/statistics-response.dto';

interface PlayerStats {
  countryCode: string;
  last: number[];
  weight: number;
  height: number;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(): Promise<StatisticsResponseDto> {
    const players = await this.prisma.player.findMany({
      select: { countryCode: true, last: true, weight: true, height: true },
    });

    if (players.length === 0) {
      return { bestCountry: null, averageBmi: null, medianHeight: null };
    }

    return {
      bestCountry: this.getBestCountry(players),
      averageBmi: this.getAverageBmi(players),
      medianHeight: this.getMedianHeight(players),
    };
  }

  private getBestCountry(
    players: PlayerStats[],
  ): BestCountryResponseDto | null {
    const countries = new Map<string, { wins: number; matches: number }>();

    for (const player of players) {
      const country = countries.get(player.countryCode) ?? {
        wins: 0,
        matches: 0,
      };

      country.wins += player.last.filter((result) => result === 1).length;
      country.matches += player.last.length;
      countries.set(player.countryCode, country);
    }

    let bestCountry: BestCountryResponseDto | null = null;

    for (const [code, country] of countries) {
      if (country.matches === 0) {
        continue;
      }

      const winRatio = country.wins / country.matches;

      if (bestCountry === null || winRatio > bestCountry.winRatio) {
        bestCountry = { code, winRatio };
      } else if (winRatio === bestCountry.winRatio && code < bestCountry.code) {
        bestCountry = { code, winRatio };
      }
    }

    if (bestCountry !== null) {
      bestCountry.winRatio = Number(bestCountry.winRatio.toFixed(2));
    }

    return bestCountry;
  }

  private getAverageBmi(players: PlayerStats[]): number {
    let totalBmi = 0;

    for (const player of players) {
      const weightKg = player.weight / 1000;
      const heightMetres = player.height / 100;
      const bmi = weightKg / (heightMetres * heightMetres);
      totalBmi += bmi;
    }

    const averageBmi = totalBmi / players.length;
    return Number(averageBmi.toFixed(2));
  }

  private getMedianHeight(players: PlayerStats[]): number {
    const heights = players
      .map((player) => player.height)
      .sort((a, b) => a - b);
    const middle = Math.floor(heights.length / 2);

    if (heights.length % 2 === 1) {
      return heights[middle];
    }

    return (heights[middle - 1] + heights[middle]) / 2;
  }
}
