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
import { BaseController } from './index';
import { authMiddleware } from '@src/middlewares/auth';
// import { User } from '@src/models/user';

@Controller('jobs')
export class JobsController extends BaseController {
  @Post('')
  @Middleware(authMiddleware)
  public async createJob(req: Request, res: Response): Promise<void> {
    req.body.createdBy = req.context?.userId;

    try {
      const job = await Job.create(req.body);
      res.status(201).json({ job });
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }

  @Get('')
  @Middleware(authMiddleware)
  public async getAllJobs(req: Request, res: Response): Promise<Response> {
    const jobs = await Job.find({ createdBy: req.context?.userId }).sort(
      'createdAt'
    );
    if (!jobs) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'No jobs were not found!',
        description: 'Try again later.',
      });
    }

    return res.json({ jobs, count: jobs.length });
  }

  // Get one job
  @Get(':id')
  @Middleware(authMiddleware)
  public async getJob(req: Request, res: Response): Promise<Response> {
    const userId = req.context?.userId;
    const jobId = req.context?.jobId;

    const job = await Job.findOne({ _id: jobId, createdBy: userId });

    if (!job) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: `No job with id ${jobId}`,
        description: 'Try again later.',
      });
    }

    return res.json({ job });
  }

  // Update a Job
  @Patch('/:id')
  @Middleware(authMiddleware)
  public async updateJob(req: Request, res: Response): Promise<Response> {
    const { company, position } = req.body;
    const userId = req.context?.userId;
    const { id: jobId } = req.params;

    if (company === '' || position === '') {
      return this.sendErrorResponse(res, {
        code: 400,
        message: 'Company and position are required!',
      });
    }

    const job = await Job.findByIdAndUpdate(
      { _id: jobId, createdBy: userId },
      { company, position },
      { new: true, runValidators: true }
    );

    if (!job) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: `No job with id ${jobId}`,
        description: 'Try again later.',
      });
    }

    return res.status(200).json({ job });
  }

  // Delete a Job
  @Delete('/:id')
  @Middleware(authMiddleware)
  public async deleteJob(req: Request, res: Response): Promise<Response> {
    const userId = req.context?.userId;
    const { id: jobId } = req.params;

    const job = await Job.findOneAndRemove({ _id: jobId, createdBy: userId });

    if (!job) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: `No job with id ${jobId}`,
        description: 'Try again later.',
      });
    }

    return res.status(200).json();
  }
}
