// Importiamo la connessione al database
const pool = require('../config/db');

const BouquetModel = {
    // Funzione per salvare un nuovo bouquet
    createBouquet: async (name, description, userId) => {
        try {
            // Usiamo sempre le query parametrizzate ($1, $2...) per la sicurezza!
            // L'ultimo valore ($3) è fondamentale: collega il bouquet all'utente loggato.
            const query = `
                INSERT INTO bouquets (name, description, user_id) 
                VALUES ($1, $2, $3) 
                RETURNING *;
            `;
            
            const values = [name, description, userId];
            const result = await pool.query(query, values);
            
            // Restituiamo il bouquet appena salvato
            return result.rows[0];
        } catch (error) {
            console.error('Errore nel DAO durante la creazione del bouquet:', error);
            throw error;
        }
    },
    // Funzione per ottenere tutti i bouquet di un utente specifico
    // 2. LA FUNZIONE AGGIORNATA: Prende i bouquet E i loro fiori unendo le tabelle!
    getBouquetsByUserId: async (userId) => {
        const query = `
            SELECT b.*, COUNT(bi.flower_id) as flower_count 
            FROM bouquets b 
            LEFT JOIN bouquet_items bi ON b.id = bi.bouquet_id 
            WHERE b.user_id = $1 
            GROUP BY b.id
            ORDER BY b.id DESC;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },
    // 3. Elimina un bouquet in sicurezza
    deleteBouquet: async (id, userId) => {
        try {
            // Chiediamo di eliminare dove l'ID del bouquet E l'ID dell'utente combaciano
            const query = 'DELETE FROM bouquets WHERE id = $1 AND user_id = $2 RETURNING *;';
            const result = await pool.query(query, [id, userId]);
            
            // Se rowCount è maggiore di 0, significa che ha trovato e cancellato il bouquet
            return result.rowCount > 0; 
        } catch (error) {
            console.error('Errore nel DAO durante l\'eliminazione del bouquet:', error);
            throw error;
        }
    },// 4. Inserisce i fiori nel bouquet
    addFlowerToBouquet: async (bouquetId, flowerId, quantity) => {
        try {
            const query = `
                INSERT INTO bouquet_items (bouquet_id, flower_id, quantity) 
                VALUES ($1, $2, $3) 
                RETURNING *;
            `;
            const result = await pool.query(query, [bouquetId, flowerId, quantity]);
            return result.rows[0];
        } catch (error) {
            console.error('Errore nel DAO durante l\'inserimento del fiore:', error);
            throw error;
        }
    },
    // 5. LA FUNZIONE PER L'ADMIN: Statistiche del negozio
    getStoreStats: async () => {
        try {
            // Contiamo quanti bouquet sono stati creati in totale
            const totalBouquetsResult = await pool.query('SELECT COUNT(*) FROM bouquets;');
            
            // Troviamo i 3 fiori più utilizzati unendo le tabelle!
            const popularFlowersResult = await pool.query(`
                SELECT f.name, SUM(bf.quantity) as total_used
                FROM bouquet_items bf
                JOIN flowers f ON bf.flower_id = f.id
                GROUP BY f.id, f.name
                ORDER BY total_used DESC
                LIMIT 3;
            `);

            // Impacchettiamo tutto in un bell'oggetto JSON
            return {
                total_bouquets_created: parseInt(totalBouquetsResult.rows[0].count),
                top_selling_flowers: popularFlowersResult.rows
            };
        } catch (error) {
            console.error('Errore nel DAO durante la lettura delle statistiche:', error);
            throw error;
        }
    },
    // 6. Cerca template per evento/stile
    getBouquetsByStyle: async (style) => {
        try {
            // Usiamo ILIKE per una ricerca flessibile e uniamo le tabelle 
            // per far vedere a Fleur anche quali fiori ci sono dentro!
            const query = `
                SELECT 
                    b.id, b.name, b.style, b.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'name', f.name,
                                'color', f.color,
                                'quantity', bf.quantity
                            )
                        ) FILTER (WHERE f.id IS NOT NULL), '[]'
                    ) AS composition
                FROM bouquets b
                LEFT JOIN bouquet_items bf ON b.id = bf.bouquet_id
                LEFT JOIN flowers f ON bf.flower_id = f.id
                WHERE b.style ILIKE $1
                GROUP BY b.id
                ORDER BY b.created_at DESC;
            `;
            
            // I simboli % dicono a Postgres di cercare la parola ovunque (es. "Matrimonio elegante")
            const result = await pool.query(query, [`%${style}%`]);
            return result.rows;
        } catch (error) {
            console.error('Errore nel DAO durante la ricerca per stile:', error);
            throw error;
        }
    }
};

module.exports = BouquetModel;