import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  STATE: 'production' | 'development';
  PORT: number;

  JWT_SECRET: string;

  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;

  NATS_SERVER_URL: string;
}

const envsSchema = joi.object({
  STATE: joi.allow('production','development').required(),
  PORT: joi.number().required(),

  JWT_SECRET: joi.string().required(),

  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().required(),
  DB_USERNAME: joi.string().required(),

  NATS_SERVER_URL: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate( process.env );

if ( error ) {
  throw new Error(`Config validation error: ${ error.message }`);
}

const envVars:EnvVars = value;


export const env = {
  STATE: envVars.STATE,
  PORT: envVars.PORT,

  JWT_SECRET: envVars.JWT_SECRET,

  DB_PASSWORD: envVars.DB_PASSWORD,
  DB_NAME: envVars.DB_NAME,
  DB_HOST: envVars.DB_HOST,
  DB_PORT: envVars.DB_PORT,
  DB_USERNAME: envVars.DB_USERNAME,

  NATS_SERVER_URL: envVars.NATS_SERVER_URL,
};