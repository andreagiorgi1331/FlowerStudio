const BouquetService = require('../services/bouquetService');
const pool = require('../config/db');
const BouquetController = {
    // (Solo per Admin) Promuove o declassa un bouquet nel Catalogo Idee
    toggleTemplateStatus: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            const { is_template } = req.body;
            const query = `UPDATE bouquets SET is_template = $1 WHERE id = $2`;
            await pool.query(query, [is_template, bouquetId]);
            res.json({ message: `Bouquet aggiornato. Template: ${is_template}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore durante l'aggiornamento del template" });
        }
    },

    // Funzione che gestisce la richiesta POST /bouquets
    createBouquet: async (req, res) => {
        try {
            const { name, wrapper, preview_image, flowers, has_ribbon, ribbon_color } = req.body;
            const userId = req.user.id;

            if (!name || !flowers || flowers.length === 0) {
                return res.status(400).json({ message: "Nome e fiori sono obbligatori!" });
            }

            const newBouquetQuery = `
                INSERT INTO bouquets (user_id, name, wrapper, preview_image, has_ribbon, ribbon_color) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING id;
            `;
            const bouquetResult = await pool.query(newBouquetQuery, [
                userId, name, wrapper, preview_image, 
                has_ribbon || false, 
                ribbon_color || '#ff0000'
            ]);
            const newBouquetId = bouquetResult.rows[0].id;

            const insertItemQuery = `
                INSERT INTO bouquet_items (bouquet_id, flower_id, position_x, position_y, quantity, scale, z_index, is_flipped) 
                VALUES ($1, $2, $3, $4, 1, $5, $6, $7)
            `;

            for (const flower of flowers) {
                await pool.query(insertItemQuery, [
                    newBouquetId, 
                    flower.id, 
                    flower.x, 
                    flower.y,
                    flower.scale || 1,
                    flower.z_index || 10,
                    flower.is_flipped || false
                ]);
            }

            res.status(201).json({ 
                message: "Bouquet salvato con successo!",
                bouquetId: newBouquetId 
            });

        } catch (error) {
            console.error("Errore salvataggio bouquet:", error);
            res.status(500).json({ message: "Errore interno del server" });
        }
    },

    // Peschiamo i bouquet dell'utente loggato
    getUserBouquets: async (req, res) => {
        try {
            const userId = req.user.id;
            const query = `
                SELECT b.*, COUNT(bi.flower_id) as flower_count 
                FROM bouquets b 
                LEFT JOIN bouquet_items bi ON b.id = bi.bouquet_id 
                WHERE b.user_id = $1 
                GROUP BY b.id
                ORDER BY b.id DESC;
            `;
            const result = await pool.query(query, [userId]);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel caricamento dei bouquet" });
        }
    },

    // Eliminiamo un bouquet
    deleteBouquet: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            const userId = req.user.id;
            await pool.query('DELETE FROM bouquets WHERE id = $1 AND user_id = $2', [bouquetId, userId]);
            res.json({ message: "Bouquet eliminato con successo!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore durante l'eliminazione" });
        }
    },

    addFlower: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            const { flowerId, quantity } = req.body;
            const userId = req.user.id;
            const result = await BouquetService.addFlower(bouquetId, flowerId, quantity || 1, userId);
            res.status(201).json({ message: "Fiore aggiunto al bouquet con successo! ", data: result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getTemplates: async (req, res) => {
        try {
            const bouquetsResult = await pool.query('SELECT * FROM bouquets WHERE is_template = true');
            const templates = bouquetsResult.rows;
            if (templates.length === 0) return res.json([]);

            const templateIds = templates.map(t => t.id);
            const flowersQuery = `
                SELECT bi.bouquet_id, f.id, f.name, f.color, f.type, bi.position_x as x, bi.position_y as y, bi.scale, bi.z_index, bi.is_flipped 
                FROM bouquet_items bi
                JOIN flowers f ON bi.flower_id = f.id
                WHERE bi.bouquet_id = ANY($1)
            `;
            const flowersResult = await pool.query(flowersQuery, [templateIds]);

            const templatesWithFlowers = templates.map(template => {
                return {
                    ...template,
                    flowers: flowersResult.rows.filter(f => f.bouquet_id === template.id)
                };
            });
            res.json(templatesWithFlowers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel caricamento dei template" });
        }
    },

    getBouquetById: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            const bouquetQuery = `SELECT * FROM bouquets WHERE id = $1`;
            const bouquetResult = await pool.query(bouquetQuery, [bouquetId]);
            
            if (bouquetResult.rows.length === 0) {
                return res.status(404).json({ message: "Bouquet non trovato" });
            }
            const bouquet = bouquetResult.rows[0];

            const flowersQuery = `
                SELECT f.id, f.name, f.color, f.type, bi.position_x as x, bi.position_y as y, bi.scale, bi.z_index, bi.is_flipped 
                FROM bouquet_items bi
                JOIN flowers f ON bi.flower_id = f.id
                WHERE bi.bouquet_id = $1
            `;
            const flowersResult = await pool.query(flowersQuery, [bouquetId]);

            res.json({
                ...bouquet,
                flowers: flowersResult.rows
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel caricamento del bouquet" });
        }
    },

    updateBouquet: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            const userId = req.user.id;
            const { name, wrapper, preview_image, flowers, has_ribbon, ribbon_color } = req.body;

            const updateQuery = `
                UPDATE bouquets SET 
                    name = $1, wrapper = $2, preview_image = $3,
                    has_ribbon = $4, ribbon_color = $5
                WHERE id = $6 AND user_id = $7
            `;
            await pool.query(updateQuery, [
                name, wrapper, preview_image, 
                has_ribbon || false, 
                ribbon_color || '#ff0000', 
                bouquetId, userId
            ]);

            await pool.query(`DELETE FROM bouquet_items WHERE bouquet_id = $1`, [bouquetId]);

            const insertItemQuery = `
                INSERT INTO bouquet_items (bouquet_id, flower_id, position_x, position_y, quantity, scale, z_index, is_flipped) 
                VALUES ($1, $2, $3, $4, 1, $5, $6, $7)
            `;
            for (const flower of flowers) {
                await pool.query(insertItemQuery, [
                    bouquetId, flower.id, flower.x, flower.y,
                    flower.scale || 1, flower.z_index || 10, flower.is_flipped || false
                ]);
            }

            res.json({ message: "Bouquet aggiornato con successo!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore durante l'aggiornamento" });
        }
    },

    // ===== AREA ADMIN =====
    getAllBouquets: async (req, res) => {
        try {
            const query = `
                SELECT b.*, u.email as user_email, u.nome as user_nome, u.cognome as user_cognome,
                       COUNT(bi.flower_id) as flower_count
                FROM bouquets b
                JOIN users u ON b.user_id = u.id
                LEFT JOIN bouquet_items bi ON b.id = bi.bouquet_id
                GROUP BY b.id, u.email, u.nome, u.cognome
                ORDER BY b.id DESC;
            `;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel recupero di tutti i bouquet" });
        }
    },

    adminDeleteBouquet: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            await pool.query('DELETE FROM bouquets WHERE id = $1', [bouquetId]);
            res.json({ message: "Bouquet rimosso dall'amministratore." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nell'eliminazione admin" });
        }
    },

    // ===== AREA COMMUNITY =====
    getPublicBouquets: async (req, res) => {
        try {
            const query = `
                SELECT b.*, u.nome as user_nome, COUNT(bi.flower_id) as flower_count 
                FROM bouquets b 
                JOIN users u ON b.user_id = u.id
                LEFT JOIN bouquet_items bi ON b.id = bi.bouquet_id 
                WHERE b.is_public = true 
                GROUP BY b.id, u.nome
                ORDER BY b.id DESC;
            `;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel caricamento della community" });
        }
    },

    togglePublic: async (req, res) => {
        try {
            const bouquetId = req.params.id;
            const userId = req.user.id;
            const { is_public } = req.body;
            await pool.query('UPDATE bouquets SET is_public = $1 WHERE id = $2 AND user_id = $3', [is_public, bouquetId, userId]);
            res.json({ message: "Visibilità aggiornata!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Errore nel cambio privacy" });
        }
    }
};

module.exports = BouquetController;