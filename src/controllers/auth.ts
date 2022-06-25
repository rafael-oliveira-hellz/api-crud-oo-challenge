import dotenv from 'dotenv';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

// Model
import User from '@src/models/User';

// Middlewares

class AuthController {
  static register = async (req: Request, res: Response) => {
    res.send('Register');
  };

  static login = async (req: Request, res: Response) => {
    res.send('Login');
  };
}

export default AuthController;
