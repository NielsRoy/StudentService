import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/env';
import { Grade } from './entites/grade.entity';
import { Student } from './entites/student.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE } from './config/services';
import { CommonModule } from './common/common.module';
import { AuthService } from './services/auth.service';
import { StudentService } from './services/student.service';
import { JwtModule } from '@nestjs/jwt';
import { GradeService } from './services/grade.service';
import { StudentHistoricService } from './services/student-historic.service';

@Module({
  imports: [
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: {
        expiresIn: '5h'
      },
    }),
    TypeOrmModule.forRoot({
      ssl: envs.STATE === 'production',
      extra: {
        ssl: envs.STATE === 'production'
          ? { rejectUnauthorized: false }
          : false
      },
      type: 'postgres',
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      username: envs.DB_USERNAME,
      password: envs.DB_PASSWORD,
      database: envs.DB_NAME,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      Grade,
      Student,
    ]),
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.NATS_HOST}:${envs.NATS_PORT}`],
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
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AuthService, StudentService, GradeService, StudentHistoricService],
})
export class AppModule { }
