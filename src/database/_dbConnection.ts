import config, { IConfig } from 'config';
import { connect as mongooseConnect, connection } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

import logger from '@src/utils/logger';

export const connect = async (): Promise<void> => {
  await mongooseConnect(dbConfig.get('mongoUrl'));

  logger.info('Connected to MongoDB Atlas');
};

export const close = (): Promise<void> => connection.close();
