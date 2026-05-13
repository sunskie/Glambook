import { Request, Response } from 'express';
import Dispute from '../models/Dispute.model';
import Booking from '../models/Booking.model';
import User from '../models/User.model';

// ─── CLIENT: File a dispute ───────────────────────────────────────────
export const fileDispute = async (req: Request, res: Response) => {
  try {
    const client = (req as any).user;
    const { bookingId, reason, description, evidenceUrls } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.clientId.toString() !== client._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existing = await Dispute.findOne({ bookingId });
    if (existing) return res.status(400).json({ success: false, message: 'Dispute already filed for this booking' });

    const dispute = await Dispute.create({
      bookingId,
      clientId: client._id,
      vendorId: booking.vendorId,
      reason,
      description,
      evidenceUrls: evidenceUrls || [],
      payoutFrozen: true,
      status: 'pending',
      timeline: [{
        event: 'Dispute filed by client',
        timestamp: new Date(),
        actor: client.name,
      }],
    });

    // Freeze the booking payout
    await Booking.findByIdAndUpdate(bookingId, { payoutFrozen: true, status: 'disputed' });

    res.status(201).json({ success: true, data: dispute });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to file dispute' });
  }
};

// ─── CLIENT: Get my disputes ──────────────────────────────────────────
export const getMyDisputes = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user._id;
    const disputes = await Dispute.find({ clientId })
      .populate('bookingId', 'bookingDate bookingTime totalPrice serviceId')
      .populate('vendorId', 'name email businessName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: disputes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get disputes' });
  }
};

// ─── VENDOR: Get disputes for my bookings ────────────────────────────
export const getVendorDisputes = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user._id;
    const disputes = await Dispute.find({ vendorId })
      .populate('bookingId', 'bookingDate bookingTime totalPrice serviceId')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: disputes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get vendor disputes' });
  }
};

// ─── VENDOR: Respond to dispute ───────────────────────────────────────
export const vendorRespondToDispute = async (req: Request, res: Response) => {
  try {
    const vendor = (req as any).user;
    const { id } = req.params;
    const { action, vendorResponseDescription, vendorEvidenceUrls } = req.body;
    // action: 'accept_refund' | 'challenge'

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    if (dispute.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData: any = {
      vendorResponseDescription,
      vendorEvidenceUrls: vendorEvidenceUrls || [],
      vendorRespondedAt: new Date(),
      status: action === 'accept_refund' ? 'resolved_refund' : 'vendor_responded',
      $push: {
        timeline: {
          event: action === 'accept_refund'
            ? 'Vendor accepted dispute and agreed to refund'
            : 'Vendor submitted counter-evidence',
          timestamp: new Date(),
          actor: vendor.name,
        }
      }
    };

    if (action === 'accept_refund') {
      updateData.resolvedAt = new Date();
      updateData.resolution = 'Vendor accepted the dispute and agreed to a full refund.';
      updateData.payoutFrozen = false;
    }

    const updated = await Dispute.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to respond to dispute' });
  }
};

// ─── ADMIN: Get ALL disputes ──────────────────────────────────────────
export const getAllDisputes = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const disputes = await Dispute.find(query)
      .populate('bookingId', 'bookingDate bookingTime totalPrice')
      .populate('clientId', 'name email')
      .populate('vendorId', 'name email businessName')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Dispute.countDocuments(query);
    const pendingCount = await Dispute.countDocuments({ status: 'pending' });
    const underReviewCount = await Dispute.countDocuments({ status: 'under_review' });

    res.json({ success: true, data: disputes, total, pendingCount, underReviewCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to get disputes' });
  }
};

// ─── ADMIN: Update status to under_review ────────────────────────────
export const markUnderReview = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: 'under_review',
        $push: { timeline: { event: 'Admin opened investigation', timestamp: new Date(), actor: admin.name } }
      },
      { new: true }
    );
    res.json({ success: true, data: dispute });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// ─── ADMIN: Resolve dispute (verdict) ────────────────────────────────
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const { verdict, resolution, refundAmount } = req.body;
    // verdict: 'resolved_refund' | 'resolved_release' | 'resolved_partial'

    const verdictLabels: any = {
      resolved_refund: 'Full refund issued to client',
      resolved_release: 'Dispute dismissed — payout released to vendor',
      resolved_partial: `Partial refund of Rs. ${refundAmount} issued to client`,
    };

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: verdict,
        resolution,
        refundAmount: refundAmount || 0,
        resolvedBy: admin._id,
        resolvedAt: new Date(),
        payoutFrozen: false,
        $push: {
          timeline: {
            event: verdictLabels[verdict] || 'Dispute resolved by admin',
            timestamp: new Date(),
            actor: admin.name,
          }
        }
      },
      { new: true }
    ).populate('clientId', 'name email').populate('vendorId', 'name email');

    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    res.json({ success: true, data: dispute });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to resolve dispute' });
  }
};
