import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankingModule } from './ranking/ranking.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
const connectionMoongoose =
  'mongodb+srv://rgmelo94:qDcOSHhQrrtSdO6e@cluster0.q9qgq6n.mongodb.net/srchallenges?retryWrites=true&w=majority&appName=Cluster0';

@Module({
  imports: [
    RankingModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(connectionMoongoose),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
