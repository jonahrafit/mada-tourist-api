// src/app.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import attractionRoutes from './routes/attractionRoutes.js';
import { MONGO_URI, PORT } from './config.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/attractions', attractionRoutes);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
