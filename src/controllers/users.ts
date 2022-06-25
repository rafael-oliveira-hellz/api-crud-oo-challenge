import { Request, Response } from 'express';

// Model
import { User } from '@src/models/User';

// Middlewares

class UserController {
  static listAllUsers = async (req: Request, res: Response) => {
    res.send('List Users');
  };

  static getUserById = async (req: Request, res: Response) => {
    res.send('Get User');
  };

  static createUser = async (req: Request, res: Response) => {
    res.send('Create User');
  };

  static updateUser = async (req: Request, res: Response) => {
    res.send('Update User');
  };

  static deleteUser = async (req: Request, res: Response) => {
    res.send('Delete User');
  };
}

export default UserController;
