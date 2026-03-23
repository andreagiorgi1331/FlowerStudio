// Importiamo il Model appena creato
const BouquetModel = require('../models/bouquetModel');

const BouquetService = {
    // Funzione per gestire la logica di creazione
    createBouquet: async (name, userId) => {
        try {
            // Regole di business: Controlliamo che i dati minimi ci siano
            if (!name) {
                throw new Error("Il nome del bouquet è obbligatorio");
            }

            // Chiamiamo il Model per salvare i dati nel database
            const newBouquet = await BouquetModel.createBouquet(name, userId);
            return newBouquet;
            
        } catch (error) {
            console.error('Errore nel Service durante la creazione del bouquet:', error);
            throw error;
        }
    },
    // Funzione per gestire la logica di lettura
    getUserBouquets: async (userId) => {
        try {
            // Chiamiamo il Model
            const bouquets = await BouquetModel.getBouquetsByUserId(userId);
            return bouquets;
        } catch (error) {
            console.error('Errore nel Service durante la lettura dei bouquet:', error);
            throw error;
        }
    },
    // 3. La funzione Service per l'eliminazione
    deleteUserBouquet: async (id, userId) => {
        try {
            const isDeleted = await BouquetModel.deleteBouquet(id, userId);
            
            // Se isDeleted è falso, significa che il bouquet non esiste o non è di questo utente
            if (!isDeleted) {
                throw new Error("Bouquet non trovato o non autorizzato all'eliminazione");
            }
            
            return true;
        } catch (error) {
            console.error('Errore nel Service durante l\'eliminazione:', error);
            throw error;
        }
    },
    // 4. La funzione Service per aggiungere fiori
    addFlower: async (bouquetId, flowerId, quantity, userId) => {
        try {
            // Regola di sicurezza: Il bouquet appartiene a questo utente?
            // Riutilizziamo la funzione che abbiamo già creato per farci dare i suoi bouquet
            const userBouquets = await BouquetModel.getBouquetsByUserId(userId);
            
            // Cerchiamo se l'ID del bouquet in cui vuole inserire i fiori è nella sua lista
            const isOwner = userBouquets.some(b => b.id === parseInt(bouquetId));
            
            if (!isOwner) {
                throw new Error("Non sei autorizzato a modificare questo bouquet");
            }

            // Se è tutto ok, procediamo con l'inserimento
            return await BouquetModel.addFlowerToBouquet(bouquetId, flowerId, quantity);
        } catch (error) {
            console.error('Errore nel Service durante l\'aggiunta del fiore:', error);
            throw error;
        }
    }
};

module.exports = BouquetService;