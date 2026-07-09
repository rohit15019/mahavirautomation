require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
// (Initial connection and server startup handled at the bottom)

// Middleware
app.use(cors({
  origin: '*', // Allows all origins, extremely helpful for local testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'x-user-role']
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Uploads as Static files
// Ensure files stored in back-end/uploads are served at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Integration
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const serviceRoutes = require('./routes/service.routes');
const downloadRoutes = require('./routes/download.routes');
const contactRoutes = require('./routes/contact.routes');
const adminRoutes = require('./routes/admin.routes');

// Mount Routers
// Note: We mount both lowercase and uppercase variations to tolerate inconsistent frontend endpoints!
app.use('/api/v1.0/auth', authRoutes);
app.use('/api/v1.0/Auth', authRoutes);

app.use('/api/v1.0/category', categoryRoutes);
app.use('/api/category', categoryRoutes);

app.use('/api/v1.0/Product', productRoutes);
app.use('/api/v1.0/Services', serviceRoutes);
app.use('/api/v1.0/Download', downloadRoutes);
app.use('/api/v1.0/Contact', contactRoutes);
app.use('/api/v1.0/Admin', adminRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Mahavir Automation Solutions API is running smoothly!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'An internal server error occurred!'
  });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log("listening for request...", PORT);
  });
});
