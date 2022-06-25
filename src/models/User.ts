import mongoose from 'mongoose';

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

const User = mongoose.model('User');

export default User;
