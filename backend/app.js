const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db'); 
const initDatabase = require('./init_db');

// Non-blocking database check (doesn't stall serverless startup)
initDatabase().catch(err => console.warn('Database init check notice:', err.message));

const flowerRoutes = require('./routes/flowerRoutes');
const userRoutes = require('./routes/userRoutes');
const bouquetRoutes = require('./routes/bouquetRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Support both direct routes (/auth/login) and prefixed (/api/auth/login)
app.use('/flowers', flowerRoutes);
app.use('/auth', userRoutes);
app.use('/bouquets', bouquetRoutes);
app.use('/chat', chatRoutes);

app.use('/api/flowers', flowerRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/bouquets', bouquetRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('Benvenuto nel backend di FlowerStudio! 🌸');
});

app.get('/api', (req, res) => {
    res.json({ message: 'API FlowerStudio attiva e funzionante su Vercel! 🌸' });
});

module.exports = app;
