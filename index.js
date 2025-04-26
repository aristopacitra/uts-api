const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const roomTypesRouter = require('./routes/roomTypes');
const schedulesRouter = require('./routes/schedules');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/rooms', roomRoutes);
app.use('/users', userRoutes);
app.use('/room-types', roomTypesRouter);
app.use('/schedules', schedulesRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});