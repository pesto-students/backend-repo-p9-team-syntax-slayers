import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { getUsers, login, register } from '../controllers/AuthController';
import { validateLogin, validateRegister } from '../middlewares/validation';
import generateTimeSlotsForSalons from '../CRONJobs/generateFirstTimeSlots';

const cronRouter = Router();

cronRouter.post(
  '/generateTimeSlotsForSalons',
  (req: Request, res: Response) => {
    generateTimeSlotsForSalons(res);
  },
);

export default cronRouter;
