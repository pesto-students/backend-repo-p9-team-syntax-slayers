import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

import {
  addSalon,
  addService,
  getSalonDetailsByUserId,
  updateSalon,
} from '../controllers/SalonAdminController';
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

salonAdminRouter.put('/updateSalon', (req: Request, res: Response) => {
  updateSalon(req, res);
});

salonAdminRouter.post(
  '/addService',
  authMiddleware,
  validateServiceInput,
  (req: Request, res: Response) => {
    addService(req, res);
  },
);

salonAdminRouter.get(
  '/getSalonDetails/:userId',
  authMiddleware,
  (req: Request, res: Response) => {
    console.log('yoooo');
    getSalonDetailsByUserId(req, res);
  },
);
export default salonAdminRouter;
