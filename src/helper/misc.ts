import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

import { postgresConnection } from '../config/dbConfig';
import tryCatchWrapper from '../utils/sentryWrapper';
import { User } from '../postgres/entity/User.entity';
import sendResponse from '../utils/sendResponse';

interface checkUserExistss {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  profile_pic_url?: string;
  type: 'salon_admin' | 'user';
  password: string;
}

const isProduction = process.env.NODE_ENV === 'production';

const checkUserExists = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const userRepository = (await postgresConnection).manager.getRepository(
      User,
    );

    const userExists = await userRepository
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.email',
        'u.firstname',
        'u.lastname',
        'u.profile_pic_url',
        'u.type',
        'u.password',
      ])
      .where('u.email = :email', { email: email })
      .getOne();

    return userExists;
  } catch (error) {
    if (isProduction) {
      Sentry.captureException(error);
      sendResponse(res, 500, false, 'Internal server error.');
      return;
    } else {
      console.error('Error occurred:', error);
      sendResponse(res, 500, false, 'Internal server error.', error);
      return;
    }
  }
};
export { checkUserExists };
