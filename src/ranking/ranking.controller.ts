import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Match } from './interfaces/match.interface';
import { RankingService } from './ranking.service';
import { RankingResponse } from './interfaces/ranking-response.interface';

@Controller('ranking')
export class RankingController {
  private logger = new Logger(RankingController.name);

  constructor(private rankingService: RankingService) {}
  @EventPattern('proccess-match')
  async processMatch(@Payload() data: any, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const originalMessage = ctx.getMessage();

    try {
      this.logger.log(`data ${JSON.stringify(data)}`);
      const matchId: string = data.matchId;
      const match: Match = data.match;

      this.rankingService.proccessMatch(matchId, match);
      await channel.ack(originalMessage);
    } catch (err) {
      this.logger.error(`Error processing match: ${err.message}`);
      channel.ack(originalMessage);
      return;
    }
    // console.log('Received match event:', match);
  }

  @MessagePattern('get-ranking')
  async getRankings(
    @Payload() data: any,
    @Ctx() ctx: RmqContext,
  ): Promise<RankingResponse | RankingResponse[]> {
    const channel = ctx.getChannelRef();
    const originalMessage = ctx.getMessage();

    try {
      this.logger.log(`data ${JSON.stringify(data)}`);
      const { category, dateRef } = data;

      const ranking = await this.rankingService.getRanking(category, dateRef);
      await channel.ack(originalMessage);

      return ranking;
    } catch (err) {
      this.logger.error(`Error getting ranking: ${err.message}`);
      channel.ack(originalMessage);
    }
    // console.log('Received get-ranking message:', data);
  }
}
