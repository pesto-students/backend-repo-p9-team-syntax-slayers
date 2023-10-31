import express from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { Response, Router, Request } from 'express';
import {
  checkout,
  paymentVerification,
} from '../controllers/paymentController';

const paymentRouter = express.Router();

paymentRouter.post('/checkout', (req: Request, res: Response) => {
  checkout(req, res);
});

paymentRouter.post('/paymentVerification', (req: Request, res: Response) => {
  paymentVerification(req, res);
});
export default paymentRouter;
