// Importiamo il livello inferiore (il Model/DAO)
const FlowerModel = require('../models/flowerModel');

const FlowerService = {
    // Funzione per gestire la logica del recupero fiori
    getAllFlowers: async () => {
        try {
            // Chiamiamo il Model per farci dare i dati dal database
            const flowers = await FlowerModel.getAllFlowers();

            // Qui potremmo aggiungere logica extra (es. filtrare fiori esauriti), 
            // ma per ora restituiamo semplicemente i dati.
            return flowers;
        } catch (error) {
            console.error('Errore nel Service durante il recupero dei fiori:', error);
            throw error;
        }
    }
};

module.exports = FlowerService;