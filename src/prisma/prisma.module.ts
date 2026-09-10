import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
