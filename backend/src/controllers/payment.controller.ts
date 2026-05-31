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
    const { bookingId, totalAmount, termsAccepted } = req.body;

    console.log('Payment initiate called with:', { bookingId, totalAmount, termsAccepted });
    console.log('User:', (req as any).user?.id);

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the Terms & Conditions before payment.',
      });
    }

    if (!bookingId || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and totalAmount are required'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please create a booking first.'
      });
    }

    // Check authorization
    if (booking.clientId.toString() !== (req as any).user._id.toString()) {
      console.error('Unauthorized payment attempt:', {
        bookingId,
        bookingClientId: booking.clientId,
        userId: (req as any).user._id,
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking.'
      });
    }

    const advanceAmount = Math.round(totalAmount * 0.15);
    const remainingAmount = totalAmount - advanceAmount;

    // Update booking with calculated amounts
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        totalAmount,
        advanceAmount,
        remainingAmount,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        isNonRefundable: false,
        paymentMethod: 'esewa',
      },
      { new: true }
    );

    console.log('Booking updated:', {
      bookingId,
      totalAmount,
      advanceAmount,
      remainingAmount,
    });

    // eSewa payload — ONLY send advanceAmount
    const esewaPayload = {
      amount: advanceAmount,
      tax_amount: 0,
      total_amount: advanceAmount,
      transaction_uuid: `booking-${bookingId}-${Date.now()}`,
      product_code: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${FRONTEND_URL}/client/payment/success`,
      failure_url: `${FRONTEND_URL}/client/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

    // Add signature
    const signatureString =
      `total_amount=${esewaPayload.total_amount},` +
      `transaction_uuid=${esewaPayload.transaction_uuid},` +
      `product_code=${esewaPayload.product_code}`;

    const signature = generateSignature(signatureString);

    console.log('eSewa signature generated:', { signature, signatureString });

    const responsePayload = {
      success: true,
      esewaPayload: { ...esewaPayload, signature },
      advanceAmount,
      remainingAmount,
      totalAmount,
    };

    console.log('Sending response payload:', responsePayload);

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Payment initiate error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment. ' + error.message
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, transaction_uuid, refId } = req.body;

    if (!bookingId || !transaction_uuid) {
      return res.status(400).json({ success: false, message: 'bookingId and transaction_uuid are required' });
    }

    // Verify signature from eSewa (simplified for now - in production, verify with eSewa API)
    // On success:
    await Booking.findByIdAndUpdate(bookingId, {
      advancePaid: true,
      paymentStatus: 'advance_paid',
      isNonRefundable: true,   // NON-REFUNDABLE after this point
      esewaTransactionId: transaction_uuid,
      esewaRefId: refId,
    });

    res.json({ success: true, message: 'Advance payment confirmed. Non-refundable.' });
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
    const { enrollmentId, totalAmount, termsAccepted } = req.body;

    console.log('Course Payment initiation:', {
      enrollmentId,
      totalAmount,
      termsAccepted,
      userId: (req as any).user?._id,
      body: req.body,
    });

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the Terms & Conditions before payment.',
      });
    }

    if (!enrollmentId || !totalAmount) {
      return res.status(400).json({ success: false, message: 'enrollmentId and totalAmount are required' });
    }

    const advanceAmount = Math.round(totalAmount * 0.15);
    const remainingAmount = totalAmount - advanceAmount;

    // Update enrollment with calculated amounts
    await Enrollment.findByIdAndUpdate(enrollmentId, {
      totalAmount,
      advanceAmount,
      remainingAmount,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      isNonRefundable: false, // becomes true after payment verified
      paymentMethod: 'esewa',
    });

    // eSewa payload — ONLY send advanceAmount
    const esewaPayload = {
      amount: advanceAmount,
      tax_amount: 0,
      total_amount: advanceAmount,
      transaction_uuid: `enrollment-${enrollmentId}-${Date.now()}`,
      product_code: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${FRONTEND_URL}/client/payment/course-success`,
      failure_url: `${FRONTEND_URL}/client/payment/course-failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

    // Add signature
    const signatureString =
      `total_amount=${esewaPayload.total_amount},` +
      `transaction_uuid=${esewaPayload.transaction_uuid},` +
      `product_code=${esewaPayload.product_code}`;

    const signature = generateSignature(signatureString);

    res.json({
      success: true,
      esewaPayload: { ...esewaPayload, signature },
      advanceAmount,
      remainingAmount,
      totalAmount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to initiate course payment' });
  }
};

export const verifyCoursePayment = async (req: Request, res: Response) => {
  try {
    const { enrollmentId, transaction_uuid, refId } = req.body;

    if (!enrollmentId || !transaction_uuid) {
      return res.status(400).json({ success: false, message: 'enrollmentId and transaction_uuid are required' });
    }

    // Verify signature from eSewa (simplified for now - in production, verify with eSewa API)
    // On success:
    await Enrollment.findByIdAndUpdate(enrollmentId, {
      advancePaid: true,
      paymentStatus: 'advance_paid',
      isNonRefundable: true,   // NON-REFUNDABLE after this point
      esewaTransactionId: transaction_uuid,
      esewaRefId: refId,
    });

    res.json({ success: true, message: 'Advance payment confirmed. Non-refundable.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.redirect(`${FRONTEND_URL}/client/payment/failure`);
    }

    // Decode base64 data from eSewa
    const decodedData = Buffer.from(data as string, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedData);
    const transactionUuid = parsedData.transaction_uuid || '';

    // Extract bookingId from transaction_uuid format: "booking-[bookingId]-[timestamp]"
    const bookingIdMatch = transactionUuid.match(/^booking-(.+?)-\d+$/);
    const enrollmentIdMatch = transactionUuid.match(/^enrollment-(.+?)-\d+$/);

    if (bookingIdMatch) {
      const bookingId = bookingIdMatch[1];
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'advance_paid',
        advancePaid: true,
        isNonRefundable: true,
        esewaTransactionId: transactionUuid,
      });
    } else if (enrollmentIdMatch) {
      const enrollmentId = enrollmentIdMatch[1];
      await Enrollment.findByIdAndUpdate(enrollmentId, {
        status: 'enrolled',
        paymentStatus: 'advance_paid',
        advancePaid: true,
        isNonRefundable: true,
        esewaTransactionId: transactionUuid,
      });
    }

    res.redirect(`${FRONTEND_URL}/client/payment/success?data=${data}`);
  } catch (error: any) {
    res.redirect(`${FRONTEND_URL}/client/payment/failure`);
  }
};

export const paymentFailure = async (req: Request, res: Response) => {
  try {
    const { transaction_uuid } = req.query;

    if (transaction_uuid) {
      const transactionUuid = transaction_uuid as string;
      const bookingIdMatch = transactionUuid.match(/^booking-(.+?)-\d+$/);
      const enrollmentIdMatch = transactionUuid.match(/^enrollment-(.+?)-\d+$/);

      if (bookingIdMatch) {
        const bookingId = bookingIdMatch[1];
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'unpaid',
          advancePaid: false,
        });
      } else if (enrollmentIdMatch) {
        const enrollmentId = enrollmentIdMatch[1];
        await Enrollment.findByIdAndUpdate(enrollmentId, {
          paymentStatus: 'unpaid',
          advancePaid: false,
        });
      }
    }

    res.redirect(`${FRONTEND_URL}/client/payment/failure`);
  } catch (error: any) {
    res.redirect(`${FRONTEND_URL}/client/payment/failure`);
  }
};
