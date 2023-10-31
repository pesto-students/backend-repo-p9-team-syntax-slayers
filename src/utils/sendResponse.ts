import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
}

const statusMessages: { [key: number]: string } = {
  200: 'Success',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  customMessage?: string,
  data?: any,
): void => {
  try {
    // ... existing code ...
    const defaultMessage = statusMessages[statusCode] || 'Unknown Status Code';
    const message = customMessage || defaultMessage;

    const response: ApiResponse = { success, status: statusCode, message };
    if (data) {
      response.data = data;
    }
    // Check if the response has already been sent
    if (!res.headersSent) {
      res.status(statusCode).json(response);
    }
  } catch (error) {
    console.error('Error occurred while sending response:', error);
    // You can log or handle the error further if needed
  }
};

export default sendResponse;
