const { Pool } = require('pg');
require('dotenv').config();

// Creiamo un "Pool" di connessioni usando i dati segreti del file .env
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1'
        ? { rejectUnauthorized: false }
        : false,
});

// Testiamo subito la connessione!
pool.connect((err, client, release) => {
    if (err) {
        console.error(' Errore di connessione al database:', err.stack);
    } else {
        console.log(' Connesso con successo al database FlowerStudio!');
    }
    // Rilasciamo il client per le prossime richieste
    if (client) release();
});

// Esportiamo la connessione per usarla in altre parti del progetto
module.exports = pool;