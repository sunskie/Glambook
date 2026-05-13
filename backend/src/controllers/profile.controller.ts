import { Request, Response } from 'express';
import User from '../models/User.model';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { name, phone, bio, businessName, businessDescription, avatar } = req.body;

    // Build update object — explicitly include phone even if empty string
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = String(phone).trim(); // force string
    if (bio !== undefined) updateData.bio = bio;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (businessDescription !== undefined) updateData.businessDescription = businessDescription;
    if (avatar !== undefined) updateData.avatar = avatar;

    console.log('Updating profile with:', updateData); // debug log

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateData }, // use $set explicitly
      { new: true, runValidators: false } // runValidators: false prevents schema validation blocking
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    console.log('Updated user phone:', updated?.phone); // debug log

    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update profile' });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { email, currentPassword } = req.body;

    if (!email || !currentPassword) {
      return res.status(400).json({ success: false, message: 'Email and current password are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify current password before changing email
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Check if email already taken
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already in use' });
    }

    const updated = await User.findByIdAndUpdate(userId, { email }, { new: true })
      .select('-password');

    res.json({ success: true, data: updated, message: 'Email updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update email' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId)
      .select('name email phone bio role avatar businessName businessDescription vendorStatus createdAt loyaltyPoints');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err: any) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};
