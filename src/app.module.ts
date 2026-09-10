import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
