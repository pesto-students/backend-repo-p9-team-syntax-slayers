import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { connectToPostgres, postgresConnection } from '../config/dbConfig';
import { User } from '../postgres/entity/User.entity';
import generateToken from '../utils/generateToken';
import { comparePassword, hashPassword } from '../utils/bcryptPassword';
import { checkUserExists } from '../helper/misc';

const login = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { password } = req.body;

    const userExists = await checkUserExists(req, res);

    if (!!userExists && userExists?.password) {
      const passMatched = await comparePassword(password, userExists?.password);

      if (passMatched) {
        const token = await generateToken(
          req,
          res,
          userExists?.id,
          userExists?.type,
        );

        const data = { token };
        sendResponse(res, 200, true, '', data);
      }
    } else {
      sendResponse(res, 404, false);
    }
  });
};

const register = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { firstname, lastname, email, password, type } = req.body;
    const userRepository = (await postgresConnection).manager.getRepository(
      User,
    );

    const userExists = await checkUserExists(req, res);

    if (userExists) {
      sendResponse(res, 200, false, 'User With This Email Already Exists');
    } else {
      const hashedPassword = await hashPassword(password);

      const userObj = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPassword,
        type: type,
      };

      const userCreated = await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(userObj)
        .execute();

      userCreated
        ? sendResponse(res, 200, true)
        : sendResponse(res, 500, false);
    }
  });
};

const getUsers = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    // Your code that may throw an error
    const postgresConnection = await connectToPostgres();
    const userRepository = postgresConnection.getRepository(User);

    // If the request is successful, send the success response with a custom message
    const data = { message: 'Request handled successfully' };
    sendResponse(res, 200, true, 'User data fetched successfully', data);

    // If the request fails, send the failure response with the default message
    // const errorMessage = 'An error occurred';
    // sendResponse(res, 500, false, errorMessage);
  });
};

export { login, register, getUsers };