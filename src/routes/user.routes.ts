import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

import {
  myBookings,
  myFavourites,
  myUpComingBookings,
  BookService,
  addFavourites,
  removeFavourites,
} from '../controllers/UserController';
import { BookingService } from '../postgres/entity/BookingService.entity';

const userRouter = Router();

userRouter.post(
  '/profile/bookService/:userId',
  authMiddleware,
  (req: Request, res: Response) => {
    BookService(req, res);
  },
);

userRouter.get(
  '/profile/myBookings/:userId',
  authMiddleware,
  (req: Request, res: Response) => {
    myBookings(req, res);
  },
);

userRouter.get(
  '/profile/myUpComingBookings/:userId',
  authMiddleware,
  (req: Request, res: Response) => {
    myUpComingBookings(req, res);
  },
);

userRouter.get(
  '/profile/myFavourites/:userId',
  authMiddleware,
  (req: Request, res: Response) => {
    myFavourites(req, res);
  },
);

userRouter.post(
  '/salon/:salonid/addFavourites',
  authMiddleware,
  (req: Request, res: Response) => {
    addFavourites(req, res);
  },
);

userRouter.post(
  '/salon/:salonid/removeFavourites',
  authMiddleware,
  (req: Request, res: Response) => {
    removeFavourites(req, res);
  },
);

export default userRouter;
