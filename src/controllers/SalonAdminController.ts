import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import {
  createSalonService,
  createServiceService,
  getSalonBookingDeatilsService,
  getSalonDetailsByUserIdService,
  updateSalonService,
  updateServiceService,
} from '../services/SalonAdmin.services';
import { SalonInput } from '../types/salon';
import { CreateService } from '../types/services';

const addSalon = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const salonInput: SalonInput = req.body;
    const createdSalon = await createSalonService(salonInput);

    !!createdSalon
      ? sendResponse(res, 200, true, '', createdSalon)
      : sendResponse(res, 404, false);
  });
};
const updateSalon = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const salonInput: SalonInput = req.body;
    const createdSalon = await updateSalonService(salonInput);

    !!createdSalon
      ? sendResponse(res, 200, true, '', createdSalon)
      : sendResponse(res, 404, false);
  });
};

const updateService = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const serviceInput: CreateService = req.body;

    const createdService = await updateServiceService(serviceInput, req);
    !!createdService
      ? sendResponse(res, 200, true, '', createdService)
      : sendResponse(res, 404, false);
  });
};

const addService = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const serviceInput: CreateService = req.body;
    console.log(req);
    const createdService = await createServiceService(serviceInput, req);
    !!createdService
      ? sendResponse(res, 200, true, '', createdService)
      : sendResponse(res, 404, false);
  });
};

const getSalonDetailsByUserId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { userId } = req.params;

    const salonDetails = await getSalonDetailsByUserIdService(userId);
    salonDetails
      ? sendResponse(res, 200, true, '', salonDetails)
      : sendResponse(res, 404, false);
  });
};

const salonBookingDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const salonBookingDetails = await getSalonBookingDeatilsService(req);
    salonBookingDetails
      ? sendResponse(res, 200, true, '', salonBookingDetails)
      : sendResponse(res, 404, false);
  });
};
export {
  addSalon,
  addService,
  getSalonDetailsByUserId,
  updateSalon,
  updateService,
  salonBookingDetails,
};
