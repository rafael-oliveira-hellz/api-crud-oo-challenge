import dotenv from 'dotenv';

import mongoose from 'mongoose';
import logger from '../utils/logger';

dotenv.config();

const MONGODB_URL: string | undefined = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(MONGODB_URL as string);

  logger.info('Connected to MongoDB Atlas');
}

main().catch((err) => logger.error(err));

export default mongoose;
