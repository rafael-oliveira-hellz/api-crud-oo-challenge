import './utils/module-alias';
import 'express-async-errors';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import bodyParser from 'body-parser';
import * as http from 'http';
import expressPino from 'express-pino-logger';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import rateLimiter from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import * as database from '@src/database';
import { UsersController } from './controllers/auth';
import logger from './logger';
// import apiSchema from './api-schema.json';
import { apiErrorValidator } from './middlewares/api-error-validator';

const swaggerDocument = YAML.load('./swagger.yaml');

export class SetupServer extends Server {
  private server?: http.Server;
  /*
   * same as this.port = port, declaring as private here will
   * add the port variable to the SetupServer instance
   */
  constructor(private port = 3000) {
    super();
  }

  /*
   * We use a different method to init instead of using the constructor
   * this way we allow the server to be used in tests and normal initialization
   */
  public async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.set('trust proxy', 1);
    this.app.use(
      rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(
      expressPino({
        logger,
      })
    );

    this.app.use(helmet());
    this.app.use(
      cors({
        origin: '*',
      })
    );
    this.app.use(xss());
  }

  private async docsSetup(): Promise<void> {
    this.app.get('/', (req, res) => {
      res.send('<h1>Jobs API</h1><a href="/docs">Documentation</a>');
    });
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: swaggerDocument as OpenAPIV3.Document,
        validateRequests: true,
        validateResponses: true,
      })
    );
  }

  private setupControllers(): void {
    const usersController = new UsersController();
    this.addControllers([usersController]);
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
