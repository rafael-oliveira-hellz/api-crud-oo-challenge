import mongoose, { Document, Model, Schema } from 'mongoose';
import AuthService from '@src/services/auth';
import logger from '@src/logger';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

interface UserModel extends Omit<User, '_id'>, Document {}

const NewUser = mongoose.model<UserModel>(
  'User',
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
    {
      toJSON: {
        transform: (_, ret): void => {
          ret.id = ret._id;
          delete ret._id;
          delete ret.__v;
        },
      },
    }
  )
);

/**
 * Validates the email and throws a validation error, otherwise it will throw a 500
 */
NewUser.schema.path('email').validate(async (email: string) => {
  const user = await User.findOne({ email });
  if (user) {
    throw new Error(CUSTOM_VALIDATION.DUPLICATED);
  }
}, 'Email already exists');

NewUser.schema.pre<UserModel>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (err) {
    logger.error(`Error hashing the password for the user ${this.name}`, err);
  }
});

export const User: Model<UserModel> = mongoose.model<UserModel>(
  'User',
  NewUser.schema
);
