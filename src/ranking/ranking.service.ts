import { Injectable, Logger } from '@nestjs/common';
import { Match } from './interfaces/match.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './interfaces/ranking.schema';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { RpcException } from '@nestjs/microservices';
import { Category } from './interfaces/categories.interface';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);
  private clientAdminBackend =
    this.clientProxySmartRankingService.getClientProxyAdminBackendInstance();

  constructor(
    @InjectModel('Ranking') private readonly rankingModel: Model<Ranking>,
    private clientProxySmartRankingService: ClientProxySmartRanking,
  ) {}

  async proccessMatch(id: string, match: Match): Promise<void> {
    this.logger.log(
      `Processing match with ID: ${id} and Match : ${JSON.stringify(match)}`,
    );

    try {
      const category: Category = await this.clientAdminBackend
        .send('get-categories', match.category)
        .toPromise();

      this.logger.log(`Category: ${JSON.stringify(category)}`);

      await Promise.all(
        match.players.map(async (player) => {
          const playerRanking = new this.rankingModel({
            category: match.category,
            challenge: match.challenge,
            player,
            match: id,
          });

          if (player !== match.def) {
            const eventFilter = category.events.filter(
              (event) => event.name == 'WIN',
            )[0];

            playerRanking.operation = 'WIN';
            playerRanking.points = eventFilter.value;
            playerRanking.operation = eventFilter.operation;
          } else {
            playerRanking.operation = 'LOSE';
            playerRanking.points = 0;
            playerRanking.operation = '-';
          }

          this.logger.log(`ranking ${JSON.stringify(playerRanking)}`);

          await playerRanking.save();
        }),
      );
    } catch (err) {
      throw new RpcException(err);
    }
  }
}
