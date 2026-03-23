// Importiamo il nostro "ponte" verso il database
const pool = require('../config/db');

const UserModel = {
    // Funzione per creare un nuovo utente nel database
    createUser: async (email, hashedPassword, role = 'user') => {
        try {
            // ATTENZIONE SICUREZZA: Usiamo $1, $2, $3 al posto dei valori reali.
            // Queste si chiamano "query parametrizzate" e bloccano la SQL Injection!
            const query = `
                INSERT INTO users (email, password, role) 
                VALUES ($1, $2, $3) 
                RETURNING id, email, role;
            `;

            // Qui passiamo i valori reali che prenderanno il posto di $1, $2 e $3
            const values = [email, hashedPassword, role];

            // Eseguiamo la query
            const result = await pool.query(query, values);

            // Restituiamo i dati dell'utente appena creato
            return result.rows[0];
        } catch (error) {
            console.error('Errore nel DAO durante la creazione dell\'utente:', error);
            throw error;
        }
    },

    createUser: async (email, password, nome, cognome) => {
        // Aggiungiamo nome e cognome alla query SQL e ai parametri ($3, $4)
        const query = `
            INSERT INTO users (email, password, nome, cognome) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email, nome, cognome, role;
        `;
        
        // Passiamo i 4 valori (ricorda: la password qui è già criptata dal service!)
        const values = [email, password, nome, cognome];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    },


    // Funzione per cercare un utente tramite la sua email (ci servirà per il login!)
    findByEmail: async (email) => {
        try {
            const query = 'SELECT * FROM users WHERE email = $1;';
            const result = await pool.query(query, [email]);
            return result.rows[0]; // Restituisce l'utente se lo trova, altrimenti undefined
        } catch (error) {
            console.error('Errore nel DAO durante la ricerca dell\'utente:', error);
            throw error;
        }
    }
};

module.exports = UserModel;