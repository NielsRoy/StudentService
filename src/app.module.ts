import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/env';
import { AcademicAdvance } from './entites/academic-advance.entity';
import { Grade } from './entites/grade.entity';
import { Student } from './entites/student.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, SCHEDULE_SERVICE, STUDY_PLAN_SERVICE } from './config/services';
import { PrerequisiteCountView } from './entites/prerequisite-count-view.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ssl: envs.state === 'production',
      extra: {
        ssl: envs.state === 'production'
        ? { rejectUnauthorized: false }
        : false
      },
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      username: envs.dbUsername,
      password: envs.dbPassword,
      database: envs.dbName,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      AcademicAdvance,
      Grade,
      Student,
      PrerequisiteCountView,
    ]),
    ClientsModule.register([
      { 
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
        }
      },
      // { 
      //   name: KAFKA_SERVICE,
      //   transport: Transport.KAFKA,
      //   options: {
      //     client: {
      //       brokers: [`${envs.kafkaHost}:${envs.kafkaPort}`],
      //     },
      //   },
      // },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
