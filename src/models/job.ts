import mongoose, { Document, Model, Schema, ObjectId } from 'mongoose';

export interface Job {
  _id?: string;
  company: string;
  position: string;
  status: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

interface JobModel extends Omit<Job, '_id'>, Document {}

const NewJob = mongoose.model<JobModel>(
  'Job',
  new Schema(
    {
      company: {
        type: String,
        required: [true, 'Company name is required'],
        maxlength: 50,
      },
      position: {
        type: String,
        required: [true, 'Position name is required'],
        maxlength: 100,
      },
      status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending',
      },
      createdBy: {
        type: String,
        ref: 'User',
        required: [true, 'Please, provide a user'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
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
 * Validates the name and job IDs and throws a validation error if there's a job with the same Id already, otherwise it will throw a 500
 */
NewJob.schema.path('_id').validate(async (_id: string) => {
  const job = await Job.findOne({ _id });

  if (job) {
    throw new Error(CUSTOM_VALIDATION.DUPLICATED);
  }
}, 'Job already exists');

NewJob.schema.pre<JobModel>('save', async function (): Promise<void> {
  if (!this.position || !this.isModified('position')) {
    return;
  } else {
    // Check if there's a job with the same id already
    const job = await Job.findOne({ _id: this.id });
    if (job) {
      throw new Error(CUSTOM_VALIDATION.DUPLICATED);
    }
  }
});

export const Job: Model<JobModel> = mongoose.model<JobModel>(
  'Job',
  NewJob.schema
);
