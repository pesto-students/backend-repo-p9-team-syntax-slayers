import { Response, Router, Request } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { getUsers, login, register } from '../controllers/AuthController';
import { validateLogin, validateRegister } from '../middlewares/validation';

const authRouter = Router();

authRouter.post('/login', validateLogin, (req: Request, res: Response) => {
  login(req, res);
});

authRouter.post(
  '/register',
  validateRegister,
  (req: Request, res: Response) => {
    register(req, res);
  },
);

// Protected route with JWT authentication middleware
authRouter.get(
  '/user',
  authMiddleware,
  validateLogin,
  (req: Request, res: Response) => {
    // Accessible only if the request has a valid JWT token and passes the authMiddleware
    getUsers(req, res);
  },
);

export default authRouter;
