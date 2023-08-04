import { Response, Router, Request } from 'express';
import {
  myFavouriteSalon,
  nearBySalons,
  salonDetails,
  searchNearBySalons,
} from '../controllers/SalonController';
import authMiddleware from '../middlewares/authMiddleware';

const salonRouter = Router();

salonRouter.get('/nearBySalons', (req: Request, res: Response) => {
  nearBySalons(req, res);
});

salonRouter.get('/searchNearBySalons', (req: Request, res: Response) => {
  searchNearBySalons(req, res);
});

salonRouter.get('/:salonId/details', (req: Request, res: Response) => {
  salonDetails(req, res);
});

salonRouter.get(
  '/:salonId/myFavouriteSalon',
  authMiddleware,
  (req: Request, res: Response) => {
    myFavouriteSalon(req, res);
  },
);

export default salonRouter;
