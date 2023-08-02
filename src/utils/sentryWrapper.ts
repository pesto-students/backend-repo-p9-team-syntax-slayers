import * as Sentry from '@sentry/node';
import { Response } from 'express';
import sendResponse from './sendResponse';

const isProduction = process.env.NODE_ENV === 'production';

const tryCatchWrapper = async (
  res: Response,
  callback: () => Promise<any>,
): Promise<any> => {
  try {
    const result = await callback();
    return result;
  } catch (error) {
    if (isProduction) {
      Sentry.captureException(error);
    } else {
      console.error('Error occurred:', error);
    }
    sendResponse(res, 500, false, 'Internal server error.');
    return null; // Return null or any other meaningful default value if needed
  }
};

export default tryCatchWrapper;
