import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { addRatingService } from '../services/Rating.services';
import { AddRating } from '../types/ratinf';

const addRating = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const newRating: AddRating = await addRatingService(req);

    newRating
      ? sendResponse(res, 200, true, '', newRating)
      : sendResponse(res, 404, false, '');
  });
};

export { addRating };
