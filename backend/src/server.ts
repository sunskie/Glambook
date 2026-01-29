import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import serviceRoutes from './routes/service.routes';
import path from 'path';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// CORS Configuration - MUST BE BEFORE ROUTES
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
// ✨ NEW: Service routes
app.use('/api/services', serviceRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'GlamBook API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      services: '/api/services'  // ✨ NEW
    }
  });
});

// ============================================
// 404 Error Handler (optional but recommended)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}`);
  console.log(`📍 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Users: http://localhost:${PORT}/api/users`);
  console.log(`📍 Services: http://localhost:${PORT}/api/services`); // ✨ NEW
});