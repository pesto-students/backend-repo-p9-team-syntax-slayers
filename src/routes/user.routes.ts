import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

import {
  myBookings,
  myFavourites,
  myUpComingBookings,
} from '../controllers/UserController';

const userRouter = Router();

userRouter.get(
  '/profile/:userId/myBookings',
  authMiddleware,
  (req: Request, res: Response) => {
    myBookings(req, res);
  },
);

userRouter.get(
  '/profile/:userId/myUpComingBookings',
  authMiddleware,
  (req: Request, res: Response) => {
    myUpComingBookings(req, res);
  },
);

userRouter.get(
  '/profile/:userId/myFavourites',
  authMiddleware,
  (req: Request, res: Response) => {
    myFavourites(req, res);
  },
);

export default userRouter;
