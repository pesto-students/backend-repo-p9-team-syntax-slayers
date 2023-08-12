import { Response, Router, Request } from 'express';
import {
  addToCart,
  removeFromCart,
  getCartListForUser,
  clearCart,
} from '../controllers/CartController';
import authMiddleware from '../middlewares/authMiddleware';

const cartRouter = Router();

cartRouter.post('/addToCart', (req: Request, res: Response) => {
  addToCart(req, res);
});

cartRouter.post('/removeFromCart', (req: Request, res: Response) => {
  removeFromCart(req, res);
});

cartRouter.get('/cartList/:userId', (req: Request, res: Response) => {
  getCartListForUser(req, res);
});

cartRouter.post('/clearCart', (req: Request, res: Response) => {
  clearCart(req, res);
});

export default cartRouter;
