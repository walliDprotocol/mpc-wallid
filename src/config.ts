/* eslint-disable @typescript-eslint/ban-ts-comment */
// const cfg = require('12factor-config');

// eslint-disable-next-line no-shadow
enum EnvEnum {
  ALLOWED_HEADERS = 'allowedHeaders',
  ALLOWED_ORIGINS = 'allowedOrigins',
  APP_NAME = 'appName',
  DEBUG = 'debug',
  DESIRED_PORT = 'PORT',
  ENABLE_CORS = 'enableCORS',
  NODE_ENV = 'nodeEnv',
  DOMAIN_ENV = 'domain_env',
  ACCEPTED_LANGS = 'acceptedLanguages',

  TOKEN_SECRET = 'TOKEN_SECRET',
  MPC_NODE_URL = 'MPC_NODE_URL',
  TESTING = 'TESTING',

  DB_TYPE = 'DB_TYPE',
  DB_HOST = 'DB_HOST',
  DB_USER = 'DB_USER',
  DB_PASS = 'DB_PASS',
  DB_NAME = 'DB_NAME',
  COMPLEMENT = 'COMPLEMENT',

  NEAR_ADMIN_ID = 'NEAR_ADMIN_ID',

}

const envVariables = {
  allowedHeaders: {
    env: 'ALLOWED_HEADERS',
    type: 'string',
  },
  allowedOrigins: {
    env: 'ALLOWED_ORIGINS',
    type: 'string',
  },
  appName: {
    env: 'APP_NAME',
    type: 'string',
    required: false,
  },
  debug: {
    env: 'DEBUG',
    type: 'string',
    // required: true,
  },
  PORT: {
    env: 'PORT',
    type: 'integer',
    required: true,
  },
  enableCORS: {
    env: 'ENABLE_CORS',
    type: 'boolean',
  },
  nodeEnv: {
    env: 'NODE_ENV',
    type: 'enum',
    values: ['development', 'production'],
    default: 'development',
  },
  domain_env: {
    env: 'DOMAIN_ENV',
    type: 'string',
    required: false,
  },
  acceptedLanguages: {
    env: 'ACCEPTED_LANGS',
    type: 'string',
    required: false,
  },
  TOKEN_SECRET: {
    env: 'TOKEN_SECRET',
    type: 'string',
    required: false,
  },
  TESTING: {
    env: 'TESTING',
    type: 'boolean',
    default: false,
  },
  DB_TYPE: {
    env: 'DB_TYPE',
    type: 'string',
    default: 'mongo-memory',
  },
  DB_HOST: {
    env: 'DB_HOST',
    type: 'string',
    required: false,
  },
  DB_USER: {
    env: 'DB_USER',
    type: 'string',
    required: false,
  },
  DB_PASS: {
    env: 'DB_PASS',
    type: 'string',
    required: false,
  },
  DB_NAME: {
    env: 'DB_NAME',
    type: 'string',
    required: true,
  },
  COMPLEMENT: {
    env: 'COMPLEMENT',
    type: 'string',
    required: false,
  },
  MPC_NODE_URL: {
    env: 'MPC_NODE_URL',
    type: 'string',
    required: true,
  },

  NEAR_ADMIN_ID: {
    env: 'NEAR_ADMIN_ID',
    type: 'string',
    required: true,
  },

} as const;

type TypeMapping = {
  'string': string;
  'number': number;
  'boolean': boolean;
  'integer': number;
  'enum': string;
};

type EnvVariablesType = {
  env: string;
  type: keyof TypeMapping;
  required?: boolean;
  values?: string[];
  default?: string | number | boolean;

};

type Config = {
  [key in EnvEnum]: typeof envVariables[key]['type'] extends keyof TypeMapping ? TypeMapping[typeof envVariables[key]['type']] : never;
};

function getEnvironmentVariables(obj: typeof envVariables) {
  return Object.keys(obj).reduce((acc, key) => {
    if (key in obj) {
      // const {
      //   env, type, required, values, default: defaultValue,
      // } = obj[key as keyof typeof obj];
      const currentEnv = obj[key as keyof typeof obj] as EnvVariablesType;
      const {
        env, type, required, values, default: defaultValue,
      } = currentEnv;
      const value = process.env[env];

      if (required && !value) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
      if (value) {
        switch (type) {
          case 'string':
            // @ts-ignore
            acc[key as EnvEnum] = value as TypeMapping['string'];
            break;
          case 'number':
            // @ts-ignore
            acc[key as EnvEnum] = Number(value) as TypeMapping['number'];
            break;
          case 'integer':
            // @ts-ignore
            acc[key as EnvEnum] = parseInt(value, 10) as TypeMapping['integer'];
            break;
          case 'boolean':
            // @ts-ignore
            acc[key as EnvEnum] = value === 'true' ? true : false as TypeMapping['boolean'];
            break;
          case 'enum':
            if (values?.includes(value)) {
            // @ts-ignore
              acc[key as EnvEnum] = value as TypeMapping['enum'];
            } else {
              throw new Error(`Invalid value for ${env}. Must be one of: ${values}`);
            }
            break;
          default:
            acc[key as EnvEnum] = value as never;
            break;
        }
      } else if (defaultValue) {
        // @ts-ignore
        acc[key as EnvEnum] = defaultValue as TypeMapping[keyof TypeMapping];
      }
    }

    return acc;
  }, {} as Config);
}

const config: Config = getEnvironmentVariables(envVariables);
// const config: Config = cfg(envVariables);
export default config;
