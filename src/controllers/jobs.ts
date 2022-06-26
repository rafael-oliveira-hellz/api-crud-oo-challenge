import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Middleware,
} from '@overnightjs/core';
import { Response, Request } from 'express';
import { Job } from '@src/models/job';
import AuthService from '@src/services/auth';
import { BaseController } from './index';
import { authMiddleware } from '@src/middlewares/auth';
