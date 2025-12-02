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

  NATS_HOST: string;
  NATS_PORT: number;
  NATS_JWT: string;
  NATS_SEED: string;
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

  NATS_HOST: joi.string().required(),
  NATS_PORT: joi.number().when('STATE', {
    is: 'development',
    then: joi.required(),
    otherwise: joi.optional(),    
  }),
   NATS_JWT: joi.string().when('STATE', {
    is: 'production',
    then: joi.required(),
    otherwise: joi.optional().default(''),
  }),
  NATS_SEED: joi.string().when('STATE', {
    is: 'production',
    then: joi.required(),
    otherwise: joi.optional().default(''),
  }),
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

  NATS_SERVER_URL: (envVars.STATE === 'development') 
    ? `nats://${envVars.NATS_HOST}:${envVars.NATS_PORT}`
    : `tls://${envVars.NATS_HOST}`,
  NATS_JWT: envVars.NATS_JWT,
  NATS_SEED: envVars.NATS_SEED,
};