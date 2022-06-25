import './utils/module-alias';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import * as http from 'http';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import * as database from '@src/database/_dbConnection';
import logger from '@src/utils/logger';
import swaggerFile from '@src/swagger/swagger_documentation.json';

import { apiErrorValidator } from './middlewares/api-error-validator';

/** Controllers */
import { AuthController } from '@src/controllers/auth';
import JobsController from '@src/controllers/jobs';
import UsersController from '@src/controllers/users';

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = 3335) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private async docSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: swaggerFile as OpenAPIV3.Document,
        validateRequests: true, //will be implemented in step2
        validateResponses: true, //will be implemented in step2
      })
    );
  }

  private setupControllers(): void {
    const authController = new AuthController();
    const jobsController = new JobsController();
    const usersController = new UsersController();
    this.addControllers([authController, jobsController, usersController]);
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  public getApp(): Application {
    return this.app;
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    }
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      logger.info('Server listening on port: ' + this.port);
    });
  }
}
