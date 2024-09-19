import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxySmartRanking } from './client-proxy';

@Module({
  imports: [ConfigModule],
  exports: [ClientProxySmartRanking],
  providers: [ClientProxySmartRanking],
})
export class ProxyrmqModule {}
