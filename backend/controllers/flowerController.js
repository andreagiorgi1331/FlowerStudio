// Importiamo il livello inferiore (il Service)
const FlowerService = require('../services/flowerService');

const FlowerController = {
    // Funzione che gestisce la richiesta HTTP HTTP (GET /flowers)
    getAllFlowers: async (req, res) => {
        try {
            // Chiediamo al Service di fare il lavoro sporco
            const flowers = await FlowerService.getAllFlowers();

            // Restituiamo una risposta HTTP di successo (Status 200) con i dati in formato JSON
            res.status(200).json(flowers);
        } catch (error) {
            // Se qualcosa va storto, restituiamo un errore HTTP (Status 500)
            res.status(500).json({ message: "Errore interno del server" });
        }
    }
};

module.exports = FlowerController;