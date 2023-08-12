import express, { Request, Response } from 'express';
import 'reflect-metadata'; // Import reflect-metadata shim
import dotenv from 'dotenv';
import helmet from 'helmet';
const cors = require('cors');
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import authLimiter from './middlewares/authLimiter';
import salonRouter from './routes/salon.routes';
import cartRouter from './routes/cart.routes';
import paymentRouter from './routes/payment.routes';
import Razorpay from 'razorpay';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
// Helmet is used to secure this app by configuring the http-header
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

//razorpay instance creation

if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
  throw new Error('Razorpay credentials are missing.');
}

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY as string,
  key_secret: process.env.RAZORPAY_API_SECRET as string,
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api/v1/auth', authRouter, authLimiter);
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1/salon', salonRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payment', paymentRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

export default app;
