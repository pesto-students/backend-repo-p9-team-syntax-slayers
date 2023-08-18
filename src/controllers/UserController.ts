import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { BookingData, MyFavSalonData } from '../types/user';
import {
  myBookingsService,
  myFavouritesService,
  myUpComingBookingsService,
  BookServiceService,
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

const myFavourites = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const myFavSalons: MyFavSalonData[] = await myFavouritesService(req);
    console.log('myFavSalons', myFavSalons);
    !!myFavSalons && !!myFavSalons.length
      ? sendResponse(res, 200, true, '', myFavSalons)
      : sendResponse(res, 200, false, 'No favourite list found');
  });
};

const BookService = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const bookingStatus = await BookServiceService(req);
  });
};

export { myBookings, myFavourites, myUpComingBookings, BookService };
