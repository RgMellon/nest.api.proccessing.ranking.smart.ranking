import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

console.log(configService.get<string>('RABBITMQ_URL'));

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

  await app.listen();
}
bootstrap();
