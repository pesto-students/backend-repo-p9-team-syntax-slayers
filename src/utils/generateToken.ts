import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const generateToken = async (
  req: Request,
  res: Response,
  userId: string,
  userType: 'user' | 'salon_admin',
  firstName?: string,
  email?: string,
  profilePicUrl?: string,
): Promise<string | null> => {
  try {
    const secretKey =
      process.env.JWT_SECRET_KEY || 'sbxxb5x7s6x_@@vx//x9sxhsa87xg6xf';
    const payload = {
      issuer: 'Saloni',
      userId,
      userType,
      firstName,
      email,
      profilePicUrl,
    };
    const token = jwt.sign(payload, secretKey, {
      expiresIn: '365d',
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    return null; // Return null or any other default value if an error occurs
  }
};

export default generateToken;
