// backend/src/models/Quiz.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

export interface IQuiz extends Document {
  courseId: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  passingScore: number; // default 70
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema({
  question: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 2 && v.length <= 6,
      message: 'A question must have between 2 and 6 options',
    },
  },
  correctAnswer: { type: Number, required: true, min: 0 },
});

const quizSchema = new Schema<IQuiz>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true,
      index: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: (v: IQuizQuestion[]) => v.length >= 1,
        message: 'A quiz must have at least 1 question',
      },
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', quizSchema);
