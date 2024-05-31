/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import { DataBase } from 'src/types/schemas';
import { DataBaseSchemas } from 'src/types/enums';

import config from 'src/config';

import connectToMongo from './mongo';

const {
  COMPLEMENT, DB_HOST, DB_NAME, DB_PASS, DB_USER, DB_TYPE,
} = config;

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('database');

// create a string for the mongoDB URI from the environment variables

const databaseURL = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}${COMPLEMENT}`;
// url += process.env.DB_PORT + '/';
// url += '?authSource=admin';
// url += '?replicaSet=' + process.env.REPL_SET;

logDebug('MONGO URI: ', databaseURL);
const mongoDB: Record<string, any> = connectToMongo(databaseURL, DB_NAME, DB_TYPE);

const Database: DataBase = {
  // Generic methods

  create: (schema: DataBaseSchemas, data: any, options: any) => mongoDB[schema].create(data, options),
  find: (schema: DataBaseSchemas, filter: any, select: any, options: any) => mongoDB[schema].find(filter, select, options),
  findOne: (schema: DataBaseSchemas, filter: any, select: any, options: any) => mongoDB[schema].findOne(filter, select, options),
  findOneAndUpdate: (schema: DataBaseSchemas, filter: any, update: any, options: any) => mongoDB[schema].findOneAndUpdate(filter, update, options),

  // Schema specific methods
  createTokenMap: (data: any, options: any) => mongoDB.token.create(data, options),
  findToken: (filter: any, select: any, options: any) => mongoDB.token.findOne(filter, select, options),

  findUser: (filter: any, select: any, options: any) => mongoDB.user.find(filter, select, options),
  findSingleUser: (filter: any, select: any, options: any) => mongoDB.user.findOne(filter, select, options),
  findUserAndUpdate: (filter: any, update: any, options: any) => mongoDB.user.findOneAndUpdate(filter, update, options),
  UpdateOneUser: (filter: any, update: any, options: any) => mongoDB.user.updateOne(filter, update, options),
  findUserById: (id: any) => mongoDB.user.findById(id),
  registerUser: (data: any, options: any) => mongoDB.user.create(data, options),
};

export default Database;

export { Database };
