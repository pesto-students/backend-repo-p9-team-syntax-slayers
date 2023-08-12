import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { instance } from '../app';
import crypto from 'crypto';

const checkout = async (req: Request, res: Response): Promise<void> => {
  const { amount } = req.body;
  var options = {
    amount: Number(amount * 100), // amount in the smallest currency unit
    currency: 'INR',
  };

  try {
    const orderId = await instance.orders.create(options);
    sendResponse(res, 200, true, 'order created', orderId);
  } catch (error) {
    console.error('Error creating order:', error);
    sendResponse(res, 500, false, 'Error creating order');
  }
};

const paymentVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return sendResponse(res, 400, false, 'Missing required fields');
  }

  // Generate the expected signature
  let body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', 'FonPOjOaMXbRZKyBbsV1qoD8')
    .update(body)
    .digest('hex');

  // Compare the provided signature with the expected one
  if (expectedSignature === razorpay_signature) {
    //DB entry is pending
    return sendResponse(res, 200, true, 'Payment verified');
  } else {
    return sendResponse(res, 400, false, 'Payment verification failed');
  }
};

export { checkout, paymentVerification };
