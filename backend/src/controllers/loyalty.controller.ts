import { Request, Response } from 'express';
import User from '../models/User.model';
import Booking from '../models/Booking.model';

const POINTS_PER_100_NPR = 1; // 1 point per Rs. 100 spent
const POINT_VALUE = 0.5; // 1 point = Rs. 0.50 discount

export const getLoyaltyBalance = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id).select('loyaltyPoints totalPointsEarned name');
    const nextTierPoints = 500;
    const currentTier = (user?.loyaltyPoints || 0) >= 500 ? 'Gold' :
                        (user?.loyaltyPoints || 0) >= 200 ? 'Silver' : 'Bronze';
    res.json({
      success: true,
      data: {
        points: user?.loyaltyPoints || 0,
        totalEarned: user?.totalPointsEarned || 0,
        tier: currentTier,
        pointsToNextTier: Math.max(0, nextTierPoints - (user?.loyaltyPoints || 0)),
        pointValue: POINT_VALUE,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get loyalty balance' });
  }
};

export const redeemPoints = async (req: Request, res: Response) => {
  try {
    const { pointsToRedeem, bookingId } = req.body;
    const user = await User.findById((req as any).user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if ((user.loyaltyPoints || 0) < pointsToRedeem) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }
    const discountAmount = pointsToRedeem * POINT_VALUE;
    user.loyaltyPoints = (user.loyaltyPoints || 0) - pointsToRedeem;
    await user.save();
    res.json({
      success: true,
      data: { discountAmount, remainingPoints: user.loyaltyPoints }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to redeem points' });
  }
};

export const awardPoints = async (bookingId: string, amount: number, clientId: string) => {
  try {
    const pointsEarned = Math.floor(amount / 100) * POINTS_PER_100_NPR;
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(clientId, {
        $inc: { loyaltyPoints: pointsEarned, totalPointsEarned: pointsEarned }
      });
    }
    return pointsEarned;
  } catch (err) {
    console.error('Failed to award points:', err);
    return 0;
  }
};
