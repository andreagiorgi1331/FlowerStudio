const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db'); 
const initDatabase = require('./init_db');

// Inizializziamo il database all'avvio
initDatabase();
const flowerRoutes = require('./routes/flowerRoutes');
const userRoutes = require('./routes/userRoutes');
const bouquetRoutes = require('./routes/bouquetRoutes');
const chatRoutes = require('./routes/chatRoutes');
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/flowers', flowerRoutes);
app.use('/auth', userRoutes);
app.use('/bouquets', bouquetRoutes);
app.use('/chat', chatRoutes);
app.get('/', (req, res) => {
    res.send('Benvenuto nel backend di FlowerStudio! ');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server avviato con successo sulla porta ${PORT} `);
});