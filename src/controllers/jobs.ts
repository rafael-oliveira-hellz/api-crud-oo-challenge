import dotenv from 'dotenv';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

// Model
import Job from '@src/models/Job';

// Middlewares

class JobController {
  static listAllJobs = async (req: Request, res: Response) => {
    res.send('List Jobs');
  };

  static getJobById = async (req: Request, res: Response) => {
    res.send('Get Job');
  };

  static createJob = async (req: Request, res: Response) => {
    res.send('Create Job');
  };

  static updateJob = async (req: Request, res: Response) => {
    res.send('Update Job');
  };

  static deleteJob = async (req: Request, res: Response) => {
    res.send('Delete Job');
  };
}

export default JobController;
