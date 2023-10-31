import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  tryCatchWrapper(res, async () => {
    // Get the token from the request headers
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // sendResponse(res, 401, false, 'Unauthorized. Token missing.');
      return;
    }

    if (!secretKey) {
      // Handle the case where the secretKey is not defined
      // sendResponse(
      //   res,
      //   500,
      //   false,
      //   'Internal server error. JWT secret key not defined.',
      // );
      return;
    }

    // Verify the token and decode the payload
    const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
    // console.log('decodedToken', decodedToken);

    req.body.payload = decodedToken; // Store the userId in the custom request object

    // Move on to the next middleware or route handler
    next();
  });
};

export default authMiddleware;
