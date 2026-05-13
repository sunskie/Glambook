import { Request, Response } from 'express';
import crypto from 'crypto';
import OTP from '../models/OTP.model';
import { sendOTPEmail } from '../utils/emailService';

// Generate and send OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { purpose } = req.body;

    // Delete any existing OTPs for this user and purpose
    await OTP.deleteMany({ userId: user._id, purpose });

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      userId: user._id,
      email: user.email,
      otp,
      purpose,
      expiresAt,
    });

    await sendOTPEmail(user.email, otp, purpose);

    res.json({ success: true, message: `OTP sent to ${user.email}` });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { otp, purpose } = req.body;

    const otpRecord = await OTP.findOne({
      userId: user._id,
      purpose,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpRecord.used = true;
    await otpRecord.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};
