import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './config/env';
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
import { HealthController } from './health.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: '5h'
      },
    }),
    TypeOrmModule.forRoot({
      ssl: env.STATE === 'production',
      extra: {
        ssl: env.STATE === 'production'
          ? { rejectUnauthorized: false }
          : false
      },
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
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
        },
      },
    ]),
    CommonModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AuthService, StudentService, GradeService, StudentHistoricService],
})
export class AppModule { }
