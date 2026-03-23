const pool = require('./config/db');

/**
 * Funzione per testare la connessione al DB con gestione dei tentativi (Retry).
 * Aspetta che il container Postgres di Docker sia pronto.
 */
const initDatabase = async (retries = 5, delay = 3000) => {
    while (retries > 0) {
        try {
            console.log(`⏳ Tentativo di connessione al database (${retries} tentativi rimasti)...`);
            
            // Facciamo solo un piccolo "Ping" per vedere se Postgres è sveglio
            await pool.query('SELECT 1');
            
            console.log('✅ Connessione stabilita! Il database Docker è pronto.');
            return; // Uscita dal loop se tutto ok, le tabelle le ha già fatte Docker!

        } catch (error) {
            retries--;
            if (retries === 0) {
                console.error('❌ Database non raggiungibile dopo diversi tentativi:', error);
                throw error;
            }
            console.log(`📴 DB non ancora pronto. Riprovo in ${delay/1000} secondi...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

module.exports = initDatabase;