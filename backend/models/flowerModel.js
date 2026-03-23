// Importiamo il nostro "ponte" verso il database
const pool = require('../config/db');

const FlowerModel = {
    // Metodo per ottenere tutti i fiori dal database
    getAllFlowers: async () => {
        try {
            // Scriviamo la query SQL
            const query = 'SELECT * FROM flowers ORDER BY name ASC;';

            // Usiamo il pool per eseguire la query
            const result = await pool.query(query);

            // Restituiamo solo le righe (i dati veri e propri)
            return result.rows;
        } catch (error) {
            console.error('Errore nel DAO durante il recupero dei fiori:', error);
            throw error; // Passiamo l'errore al livello superiore
        }
    }
};

module.exports = FlowerModel;