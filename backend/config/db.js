const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// SSL viene abilitato solo se ci troviamo in ambiente di produzione (es. Vercel)
// oppure se è definita la stringa DATABASE_URL di Supabase in cloud.
const useSSL = isProduction || hasDatabaseUrl;
const sslOption = useSSL ? { rejectUnauthorized: false } : false;

const poolConfig = hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslOption,
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        ssl: sslOption,
      };

const pool = new Pool(poolConfig);

// Test di verifica della connessione al Pool
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Errore di connessione al database:', err.stack);
    } else {
        console.log('✅ Connesso con successo al database FlowerStudio!');
    }
    if (client) release();
});

module.exports = pool;