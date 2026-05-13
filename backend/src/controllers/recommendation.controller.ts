import { Request, Response } from 'express';
import Service from '../models/service.model';
import Course from '../models/Course.model';
import Booking from '../models/Booking.model';

export const getServiceRecommendations = async (req: Request, res: Response) => {
  try {
    const { serviceId, category, maxPrice, limit = 4 } = req.query;

    const query: any = { status: 'active' };
    if (serviceId) query._id = { $ne: serviceId as string };

    // Fetch broader pool first
    const allServices = await Service.find(query)
      .populate('vendorId', 'name')
      .limit(20);

    // Score each service — pure algorithm, no AI
    const scored = allServices.map((s: any) => {
      let score = 0;
      // Same category = highest relevance
      if (s.category === category) score += 50;
      // Price within 50% range = good match
      if (maxPrice) {
        const priceDiff = Math.abs(s.price - Number(maxPrice)) / Number(maxPrice);
        if (priceDiff < 0.5) score += 30 - (priceDiff * 20);
      }
      // Higher rating = better
      score += (s.rating || 0) * 4;
      // More reviews = more trusted
      score += Math.min(s.reviewCount || 0, 10);
      return { service: s, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    const topServices = scored.slice(0, Number(limit)).map(s => s.service);

    res.json({ success: true, data: { services: topServices } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get recommendations' });
  }
};

export const getCourseRecommendations = async (req: Request, res: Response) => {
  try {
    const { courseId, category, limit = 4 } = req.query;

    const query: any = { status: 'active' };
    if (category) query.category = category;
    if (courseId) query._id = { $ne: courseId as string };

    const courses = await Course.find(query)
      .populate('vendorId', 'name')
      .sort({ rating: -1, enrollmentCount: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: { courses } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to get course recommendations' });
  }
};
