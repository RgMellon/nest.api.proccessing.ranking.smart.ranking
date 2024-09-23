import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { formatInTimeZone } from 'date-fns-tz';

const configService = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get<string>('RABBITMQ_USER')}:${configService.get<string>('RABBITMQ_PASSWORD')}@${configService.get<string>('RABBITMQ_URL')}/${configService.get<string>('RABBITMQ_PROJECT_NAME')}`,
      ],
      noAck: false,
      queue: 'ranking',
    },
  });

  Date.prototype.toJSON = function (): any {
    const timeZone = 'America/Sao_Paulo';
    return formatInTimeZone(this, timeZone, 'yyyy-MM-dd HH:mm:ss.SSS');
  };

  await app.listen();
}
bootstrap();
