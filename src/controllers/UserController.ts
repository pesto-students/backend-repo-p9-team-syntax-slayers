import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { BookingData, MyFavSalonData } from '../types/user';
import {
  myBookingsService,
  myFavouritesService,
  myUpComingBookingsService,
  BookServiceService,
  addFavouritesService,
  removeFavouritesService,
} from '../services/User.services';

const myBookings = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const myBookings: BookingData = await myBookingsService(req);

    !!myBookings
      ? sendResponse(res, 200, true, '', myBookings)
      : sendResponse(res, 404, false);
  });
};

const myUpComingBookings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const myBookings: BookingData = await myUpComingBookingsService(req);

    !!myBookings
      ? sendResponse(res, 200, true, '', myBookings)
      : sendResponse(res, 404, false);
  });
};

const addFavourites = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const addFavourite = await addFavouritesService(req);

    !!addFavourite
      ? sendResponse(res, 200, true, '')
      : sendResponse(res, 400, false, '');
  });
};

const removeFavourites = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const removeFavourite = await removeFavouritesService(req);

    !!removeFavourite
      ? sendResponse(res, 200, true, '')
      : sendResponse(res, 200, false, '');
  });
};

const myFavourites = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const myFavSalons: MyFavSalonData[] = await myFavouritesService(req);

    !!myFavSalons && !!myFavSalons.length
      ? sendResponse(res, 200, true, '', myFavSalons)
      : sendResponse(res, 200, false, 'No favourite list found');
  });
};

const BookService = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const bookingStatus = await BookServiceService(req);

    !!bookingStatus
      ? sendResponse(res, 200, true, '')
      : sendResponse(res, 400, false, '');
  });
};

export {
  myBookings,
  myFavourites,
  myUpComingBookings,
  BookService,
  addFavourites,
  removeFavourites,
};
