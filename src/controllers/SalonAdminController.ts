import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { createSalon, createService } from '../services/SalonAdmin.services';
import { SalonInput } from '../types/salon';
import { CreateService } from '../types/services';

const addSalon = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const salonInput: SalonInput = req.body;
    const createdSalon = await createSalon(salonInput);

    !!createdSalon
      ? sendResponse(res, 200, true, '', createdSalon)
      : sendResponse(res, 404, false);
  });
};

const addService = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const serviceInput: CreateService = req.body;

    const createdService = await createService(serviceInput, req);
    !!createdService
      ? sendResponse(res, 200, true, '', createdService)
      : sendResponse(res, 404, false);
  });
};
export { addSalon, addService };
