import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { validateAddRating } from '../middlewares/validation';
import { addRating, salonRatings } from '../controllers/RatingController';

const ratingRouter = Router();

ratingRouter.post(
  '/salon/addRating',
  authMiddleware,
  validateAddRating,
  (req: Request, res: Response) => {
    addRating(req, res);
  },
);

ratingRouter.get(
  '/salon/ratings/:salonid/:userId',
  (req: Request, res: Response) => {
    salonRatings(req, res);
  },
);

export default ratingRouter;
