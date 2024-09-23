import { Injectable, Logger } from '@nestjs/common';
import { Match } from './interfaces/match.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './interfaces/ranking.schema';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { RpcException } from '@nestjs/microservices';
import { Category } from './interfaces/categories.interface';
import { RankingResponse } from './interfaces/ranking-response.interface';
import { formatInTimeZone } from 'date-fns-tz';
import { Challenge } from './interfaces/challenge.interface';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);
  private clientAdminBackend =
    this.clientProxySmartRankingService.getClientProxyAdminBackendInstance();
  private clientChallenge =
    this.clientProxySmartRankingService.getClientProxyChallengeInstance();

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

          if (player == match.def) {
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

  async getRanking(
    category: string,
    dateRef: string,
  ): Promise<RankingResponse[] | RankingResponse> {
    try {
      this.logger.log(`getRanking ${JSON.stringify(category)}`);

      if (!dateRef) {
        const timeZone = 'America/Sao_Paulo';
        dateRef = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
        this.logger.log(`dateRef: ${dateRef}`);
      }

      const registredRanking = await this.rankingModel
        .find()
        .where('category')
        .equals(category)
        .exec();

      const completedChallenge: Challenge[] = await this.clientChallenge
        .send('get-completed-challenges', { category, dateRef })
        .toPromise();

      this.logger.debug(
        `completed challenge: ${JSON.stringify(completedChallenge)}`,
      );

      const challengeIds = new Set(
        completedChallenge
          .filter((item) => item.category === category)
          .map((item) => item._id),
      );

      const filteredRankings = registredRanking.filter((itemRanking) => {
        return challengeIds.has(itemRanking.challenge.toString());
      });

      const playersID = new Map();

      filteredRankings.forEach((itemRanking) => {
        if (!playersID.has(itemRanking.player.toString())) {
          playersID.set(itemRanking.player.toString(), []);
        }

        playersID.get(itemRanking.player.toString()).push(itemRanking);
      });

      const result = [];

      playersID.forEach((matches, player) => {
        const score = matches.reduce((acc, item) => acc + item.points, 0);

        let wins = 0;
        let losses = 0;

        matches.forEach((item) => {
          if (item.points > 0) wins++;
          else if (item.points === 0) losses++;
        });

        result.push({
          player,
          score,
          matchHistory: { wins, losses },
        });
      });

      return result;
    } catch (err) {
      this.logger.error(`Error ${err.message}`);

      throw new RpcException(err.message);
    }
  }
}
