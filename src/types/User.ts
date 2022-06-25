import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}
