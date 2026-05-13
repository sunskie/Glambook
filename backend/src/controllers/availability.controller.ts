import { Request, Response } from 'express';
import VendorAvailability from '../models/VendorAvailability.model';
import Booking from '../models/Booking.model';

export const getMyAvailability = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user._id;
    let availability = await VendorAvailability.findOne({ vendorId });
    if (!availability) {
      availability = await VendorAvailability.create({ vendorId });
    }
    res.json({ success: true, data: availability });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get availability' });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user._id;
    const { workingDays, workingHours, slotDuration, blockedDates } = req.body;
    const availability = await VendorAvailability.findOneAndUpdate(
      { vendorId },
      { workingDays, workingHours, slotDuration, blockedDates },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: availability });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { vendorId, date, serviceDuration } = req.query;
    const vendorIdStr = vendorId as string;
    const availability = await VendorAvailability.findOne({ vendorId: vendorIdStr });
    if (!availability) {
      return res.json({ success: true, data: { slots: [] } });
    }

    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.getDay();

    // Check if day is working day
    if (!availability.workingDays.includes(dayOfWeek)) {
      return res.json({ success: true, data: { slots: [], reason: 'Not a working day' } });
    }

    // Check if date is blocked
    const isBlocked = availability.blockedDates.some(
      d => new Date(d).toDateString() === requestedDate.toDateString()
    );
    if (isBlocked) {
      return res.json({ success: true, data: { slots: [], reason: 'Date is blocked' } });
    }

    // Generate slots
    const slots: string[] = [];
    const [startH, startM] = availability.workingHours.start.split(':').map(Number);
    const [endH, endM] = availability.workingHours.end.split(':').map(Number);
    const duration = Number(serviceDuration) || availability.slotDuration;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current += availability.slotDuration;
    }

    // Remove already booked slots
    const existingBookings = await Booking.find({
      vendorId: vendorIdStr,
      bookingDate: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ['pending', 'confirmed'] },
    }).select('bookingTime');

    const bookedTimes = existingBookings.map(b => b.bookingTime);
    const availableSlots = slots.filter(s => !bookedTimes.includes(s));

    res.json({ success: true, data: { slots: availableSlots } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get slots' });
  }
};
