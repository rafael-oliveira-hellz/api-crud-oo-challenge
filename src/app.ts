import './utils/module-alias';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import expressPino from 'express-pino-logger';
// import * as swaggerUi from 'swagger-ui-express';
// import swaggerFile from './swagger/swagger_documentation.json';

import logger from './utils/logger';

// Routing
import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import usersRouter from './routes/users';

// Error Handlers
// import notFound from '@src/middlewares/not-found';
// import errorHandler from '@src/middlewares/error-handler';

dotenv.config();

class App {
  public server: express.Application;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.setUpErrorHandlers();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(expressPino({ logger }));
    this.server.use(
      cors({ credentials: true, origin: 'http://localhost:3000' })
    );
    this.server.use(express.static(__dirname + '/public'));
  }

  routes() {
    this.server.use('/auth', authRouter);
    this.server.use('/api/v1', usersRouter, jobsRouter);
    // this.server.use(
    //   '/api/v1/docs',
    //   swaggerUi.serve,
    //   swaggerUi.setup(swaggerFile)
    // );
  }

  setUpErrorHandlers(): void {
    // this.server.use(notFound);
    // this.server.use(errorHandler);
  }
}

export default new App().server;
