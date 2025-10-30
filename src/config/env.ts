import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  STATE: 'production' | 'development';
  PORT: number;

  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;

  NATS_HOST: string;
  NATS_PORT: number;

  KAFKA_HOST: string;
  KAFKA_PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
}

const envsSchema = joi.object({
  STATE: joi.allow('production','development').required(),
  PORT: joi.number().required(),

  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().required(),
  DB_USERNAME: joi.string().required(),

  NATS_HOST: joi.string().required(),
  NATS_PORT: joi.number().required(),

  KAFKA_HOST: joi.string().required(),
  KAFKA_PORT: joi.number().required(),
  
  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate( process.env );

if ( error ) {
  throw new Error(`Config validation error: ${ error.message }`);
}

const envVars:EnvVars = value;


export const envs = {
  state: envVars.STATE,
  port: envVars.PORT,
  dbPassword: envVars.DB_PASSWORD,
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUsername: envVars.DB_USERNAME,

  natsHost: envVars.NATS_HOST,
  natsPort: envVars.NATS_PORT,

  kafkaHost: envVars.KAFKA_HOST,
  kafkaPort: envVars.KAFKA_PORT,
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
};