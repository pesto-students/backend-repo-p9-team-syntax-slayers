import express, { Request, Response } from 'express';
import 'reflect-metadata'; // Import reflect-metadata shim
import dotenv from 'dotenv';
import helmet from 'helmet';

import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import authLimiter from './middlewares/authLimiter';
import salonRouter from './routes/salon.routes';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Helmet is used to secure this app by configuring the http-header
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.use('/api/v1/auth', authRouter, authLimiter);
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1/salon', salonRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

export default app;
