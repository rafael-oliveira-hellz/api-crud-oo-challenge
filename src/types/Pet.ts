import { ObjectId } from 'mongodb';
import { IUser } from './User';

type User = {
  _id?: ObjectId;
  name?: string;
  email?: string;
  avatar?: string;
};

export interface IPet {
  _id: ObjectId;
  name: string;
  age: number;
  weight: number;
  color: string;
  type: string;
  breed: string;
  description: string;
  images?: Array<string>;
  available?: boolean;
  user?: IUser;
  adopter?: User;
  createdAt: Date;
  updatedAt: Date;
}
