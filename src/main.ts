import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { env } from './config/env';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [env.NATS_SERVER_URL],
      authenticator: (env.STATE === 'production') 
        ? {
            type: 'jwt',
            jwt: {
              jwt: env.NATS_JWT,
              seed: env.NATS_SEED,
            },
          }
        : undefined,
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    },
  });
  
  await app.startAllMicroservices();

  await app.listen(env.PORT, '0.0.0.0');
  
  console.log(`Microservicio corriendo. HTTP: ${env.PORT}, NATS: Conectado`);
}
bootstrap();
