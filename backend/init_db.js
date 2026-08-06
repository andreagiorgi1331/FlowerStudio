const pool = require('./config/db');

/**
 * Funzione per testare la connessione al DB con gestione dei tentativi (Retry).
 * Utile sia in ambiente locale/Docker (in attesa dell'avvio del container PostgreSQL)
 * che in cloud.
 */
const initDatabase = async (retries = 5, delay = 3000) => {
    while (retries > 0) {
        try {
            console.log(`⏳ Tentativo di connessione al database (${retries} tentativi rimasti)...`);
            
            // Ping di verifica per accertarsi che PostgreSQL sia pronto a ricevere query
            await pool.query('SELECT 1');
            
            console.log('✅ Connessione stabilita! Il database è pronto.');
            return;

        } catch (error) {
            retries--;
            if (retries === 0) {
                console.error('❌ Database non raggiungibile dopo diversi tentativi:', error);
                throw error;
            }
            console.log(`📴 DB non ancora pronto. Riprovo in ${delay / 1000} secondi...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

module.exports = initDatabase;