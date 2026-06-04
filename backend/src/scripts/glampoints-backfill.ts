import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Booking from '../models/Booking.model';
import User from '../models/User.model';
import { logger } from '../utils/logger';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    };

    await mongoose.connect(mongoURI, options);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const backfillGlampoints = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting glampoints backfill migration...');

    const completedBookings = await Booking.find({
      status: 'completed',
      loyaltyDiscountApplied: { $ne: true },
    });

    logger.info(`📊 Found ${completedBookings.length} completed bookings to process`);

    const clientMap: Record<string, number> = {};
    for (const booking of completedBookings) {
      const id = booking.clientId.toString();
      if (!clientMap[id]) {
        clientMap[id] = 0;
      }
      clientMap[id]++;
    }

    logger.info(`👥 Processing ${Object.keys(clientMap).length} unique clients`);

    let updatedCount = 0;
    const updates: Array<{ clientId: string; bookingCount: number; totalPoints: number; finalPoints: number; discountUnlocked: boolean }> = [];

    for (const [clientId, count] of Object.entries(clientMap)) {
      const user = await User.findById(clientId);
      if (!user) {
        logger.warn(`⚠️  User ${clientId} not found, skipping`);
        continue;
      }

      if (user.loyaltyPoints > 0) {
        logger.info(`⏭️  User ${clientId} already has ${user.loyaltyPoints} points, skipping (double-count prevention)`);
        continue;
      }

      const totalPoints = count * 20;
      const finalPoints = totalPoints % 100;
      const unlockedAtLeastOnce = totalPoints >= 100;

      user.loyaltyPoints = finalPoints;
      user.discountUnlocked = unlockedAtLeastOnce;
      await user.save();

      updates.push({
        clientId,
        bookingCount: count,
        totalPoints,
        finalPoints,
        discountUnlocked: unlockedAtLeastOnce,
      });

      updatedCount++;

      logger.info(
        `✅ User ${clientId}: ${count} bookings, ${totalPoints} total points, ` +
        `final balance ${finalPoints}, discountUnlocked: ${unlockedAtLeastOnce}`
      );
    }

    logger.info(`\n📈 Migration Summary:`);
    logger.info(`   Total users updated: ${updatedCount}`);
    logger.info(`   Completed bookings processed: ${completedBookings.length}`);
    logger.info(`   Unique clients affected: ${Object.keys(clientMap).length}`);

    if (updates.length > 0) {
      logger.info(`\n📋 Sample updates:`);
      updates.slice(0, 5).forEach(update => {
        logger.info(`   - User ${update.clientId}: ${update.bookingCount} bookings → ${update.finalPoints} points (unlocked: ${update.discountUnlocked})`);
      });
      if (updates.length > 5) {
        logger.info(`   ... and ${updates.length - 5} more`);
      }
    }

    logger.info(`\n✨ Migration complete!`);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('🔌 Database connection closed');
  }
};

(async () => {
  await connectDB();
  await backfillGlampoints();
})();
