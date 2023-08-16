import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

import { addSalon, addService } from '../controllers/SalonAdminController';
import {
  validateSalonCreate,
  validateServiceInput,
} from '../middlewares/validation';

const salonAdminRouter = Router();

salonAdminRouter.post(
  '/addSalon',
  validateSalonCreate,
  (req: Request, res: Response) => {
    addSalon(req, res);
  },
);

salonAdminRouter.post(
  '/addService',
  authMiddleware,
  validateServiceInput,
  (req: Request, res: Response) => {
    addService(req, res);
  },
);

export default salonAdminRouter;
