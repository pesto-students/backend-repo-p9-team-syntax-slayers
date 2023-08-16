import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { postgresConnection } from '../config/dbConfig';

import { Salon } from '../postgres/entity/Salon.entity';
import { Salon as ISalon } from '../types/salon';
import { Service } from '../postgres/entity/Service.entity';
import {
  getSalonServicesService,
  myFavouriteSalonService,
  nearBySalonsService,
  salonDetailsService,
  searchNearBySalonsService,
} from '../services/Salon.services';

const searchNearBySalons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const nearBySalons = await searchNearBySalonsService(req);

    nearBySalons
      ? sendResponse(res, 200, true, '', nearBySalons)
      : sendResponse(res, 404, false, '');
  });
};

const nearBySalons = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const nearBySalons = await nearBySalonsService(req);

    nearBySalons
      ? sendResponse(res, 200, true, '', nearBySalons)
      : sendResponse(res, 404, false, '');
  });
};

const salonDetails = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const salonDetails = await salonDetailsService(req);

    salonDetails
      ? sendResponse(res, 200, true, '', salonDetails)
      : sendResponse(res, 404, false, '');
  });
};

const myFavouriteSalon = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const myFavouriteSalon = await myFavouriteSalonService(req);

    myFavouriteSalon
      ? sendResponse(res, 200, true, '', myFavouriteSalon)
      : sendResponse(res, 404, false, '');
  });
};

const getSalonServices = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const listOfServices = await getSalonServicesService(req);

    listOfServices
      ? sendResponse(res, 200, true, '', listOfServices)
      : sendResponse(res, 404, false, '');
  });
};

export {
  nearBySalons,
  searchNearBySalons,
  salonDetails,
  myFavouriteSalon,
  getSalonServices,
};
