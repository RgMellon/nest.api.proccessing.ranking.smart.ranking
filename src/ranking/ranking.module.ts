import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingSchema } from './interfaces/ranking.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyrmqModule } from 'src/proxyrmq/proxyrmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ranking', schema: RankingSchema }]),
    ProxyrmqModule,
  ],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
