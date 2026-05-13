import { Request, Response } from 'express';
import crypto from 'crypto';
import Booking from '../models/Booking.model';
import Enrollment from '../models/Enrollment.model';

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_URL = process.env.ESEWA_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const generateSignature = (message: string): string => {
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
};

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { type, id, amount } = req.body;

    if (!type || !id || !amount) {
      return res.status(400).json({ success: false, message: 'type, id and amount are required' });
    }

    const totalAmount = parseFloat(parseFloat(amount).toFixed(2));
    const transactionUuid = `${type}-${id}-${Date.now()}`;

    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_MERCHANT_CODE}`;
    const signature = generateSignature(signatureMessage);

    const paymentData = {
      amount: totalAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_MERCHANT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${FRONTEND_URL}/payment/success?type=${type}&id=${id}`,
      failure_url: `${FRONTEND_URL}/payment/failure?type=${type}&id=${id}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    };

    res.json({ success: true, data: { paymentData, esewaUrl: ESEWA_URL } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { data, type, id } = req.query;

    if (!data) {
      return res.status(400).json({ success: false, message: 'No payment data received' });
    }

    const decodedData = JSON.parse(
      Buffer.from(data as string, 'base64').toString('utf-8')
    );

    if (decodedData.status !== 'COMPLETE') {
      return res.json({ success: false, message: 'Payment not completed', data: decodedData });
    }

    // Verify signature from eSewa
    const signatureMessage = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${decodedData.product_code},signed_field_names=${decodedData.signed_field_names}`;
    const expectedSignature = generateSignature(signatureMessage);

    if (expectedSignature !== decodedData.signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update record based on type
    if (type === 'booking') {
      await Booking.findByIdAndUpdate(id, {
        status: 'confirmed',
      });
    } else if (type === 'enrollment') {
      await Enrollment.findByIdAndUpdate(id, {
        paymentStatus: 'paid',
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and confirmed',
      data: decodedData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;

    if (type === 'booking') {
      const booking = await Booking.findById(id).select('status totalPrice');
      return res.json({ success: true, data: booking });
    } else if (type === 'enrollment') {
      const enrollment = await Enrollment.findById(id).select('paymentStatus totalPrice');
      return res.json({ success: true, data: enrollment });
    }

    res.status(400).json({ success: false, message: 'Invalid type' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get payment status' });
  }
};

export const initiateCoursePayment = async (req: Request, res: Response) => {
  try {
    const { amount, courseId, courseName } = req.body;
    const clientId = (req as any).user._id;

    const transaction_uuid = `COURSE-${courseId}-${clientId}-${Date.now()}`;
    const product_code = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = generateSignature(message);

    res.json({
      amount,
      transaction_uuid,
      product_code,
      signature,
      courseId,
      courseName,
      success_url: `${FRONTEND_URL}/payment/course-success`,
      failure_url: `${FRONTEND_URL}/payment/course-failure`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to initiate course payment' });
  }
};
