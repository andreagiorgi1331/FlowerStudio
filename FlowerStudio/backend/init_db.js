const pool = require('./config/db');

/**
 * Funzione per inizializzare il DB con gestione dei tentativi (Retry)
 * Questo evita che il backend crashi se il container Postgres non è ancora pronto.
 */
const initDatabase = async (retries = 5, delay = 3000) => {
    while (retries > 0) {
        try {
            console.log(` Tentativo di connessione al database (${retries} tentativi rimasti)...`);
            
            // 1. Test di connessione
            await pool.query('SELECT 1');
            console.log(' Connessione stabilita! Inizio inizializzazione schema...');

            // 2. Tabella UTENTI
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    cognome VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'user',
                    is_admin BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // 3. Tabella FIORI (Sempre con UNIQUE sul nome per l'UPSERT)
            await pool.query(`
                CREATE TABLE IF NOT EXISTS flowers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    category VARCHAR(100),
                    color VARCHAR(50),
                    description TEXT,
                    type VARCHAR(50) DEFAULT 'flower'
                );
            `);

            // Migrazioni veloci per colonne nuove
            await pool.query(`ALTER TABLE flowers ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
            await pool.query(`ALTER TABLE flowers ADD COLUMN IF NOT EXISTS description TEXT;`);
            await pool.query(`ALTER TABLE flowers ADD COLUMN IF NOT EXISTS color VARCHAR(50);`);
            await pool.query(`ALTER TABLE flowers ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'flower';`);

            // Garantisce che esista un vincolo di unicità sul nome per l'UPSERT
            await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS flowers_name_key ON flowers (name);`);

            // 4. Tabella BOUQUETS
            await pool.query(`
                CREATE TABLE IF NOT EXISTS bouquets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    wrapper VARCHAR(50),
                    preview_image TEXT,
                    is_template BOOLEAN DEFAULT false,
                    is_public BOOLEAN DEFAULT false,
                    has_ribbon BOOLEAN DEFAULT false,
                    ribbon_color VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // 5. Tabella BOUQUET_ITEMS
            await pool.query(`
                CREATE TABLE IF NOT EXISTS bouquet_items (
                    id SERIAL PRIMARY KEY,
                    bouquet_id INTEGER REFERENCES bouquets(id) ON DELETE CASCADE,
                    flower_id INTEGER REFERENCES flowers(id),
                    position_x FLOAT NOT NULL,
                    position_y FLOAT NOT NULL,
                    scale FLOAT DEFAULT 1.0,
                    z_index INTEGER DEFAULT 10,
                    is_flipped BOOLEAN DEFAULT false,
                    quantity INTEGER DEFAULT 1
                );
            `);

            // 6. POPOLAMENTO / AGGIORNAMENTO FIORI (UPSERT)
            console.log(' Sincronizzazione catalogo fiori...');
            const flowers = [
                ['Amaryllis', 'Protagonisti', 'Rosso', 'Fiore grande ed elegante, molto usato nelle composizioni importanti.', 'flower'],
                ['Campanula', 'Fiori medi', 'Viola', 'Piccoli fiori a campana delicati e ornamentali.', 'flower'],
                ['Cosmos', 'Fiori medi', 'Rosa', 'Fiore leggero e romantico con petali sottili.', 'flower'],
                ['Dalia fucsia', 'Protagonisti', 'Fucsia', 'Varietà di dalia dal colore intenso e molto decorativa.', 'flower'],
                ['Dalia bianca', 'Protagonisti', 'Bianco', 'Fiore ricco di petali, molto scenografico nei bouquet.', 'flower'],
                ['Garofano', 'Fiori medi', 'Pesca', 'Fiore resistente e profumato con petali frastagliati.', 'flower'],
                ['Gerbera', 'Protagonisti', 'Arancione', 'Fiore vivace simile a una margherita, molto usato nei mazzi.', 'flower'],
                ['Giglio', 'Protagonisti', 'Bianco', 'Fiore elegante e profumato, simbolo di purezza.', 'flower'],
                ['Girasole', 'Protagonisti', 'Giallo', 'Fiore grande e luminoso che ricorda il sole.', 'flower'],
                ['Ibisco', 'Protagonisti', 'Rosso', 'Fiore tropicale dai grandi petali aperti.', 'flower'],
                ['Lavanda', 'Profumati', 'Viola', 'Pianta profumata dal tipico colore viola.', 'flower'],
                ['Lisianthus', 'Fiori medi', 'Viola', 'Fiore delicato ed elegante simile a una rosa.', 'flower'],
                ['Margherita', 'Fiori medi', 'Bianco', 'Fiore semplice e campestre molto riconoscibile.', 'flower'],
                ['Ortensia', 'Protagonisti', 'Blu', 'Fiore a grappolo molto voluminoso e decorativo.', 'flower'],
                ['Rosa rosa', 'Protagonisti', 'Rosa', 'Classica rosa dal colore romantico.', 'flower'],
                ['Viola', 'Fiori medi', 'Viola', 'Piccolo fiore colorato molto diffuso nei giardini.', 'flower'],
                ['Eucalipto', 'Verde', 'Verde', 'Foglie di eucalipto per riempimento.', 'leaf'],
                ['Felce', 'Verde', 'Verde Scuro', 'Foglie di felce per texture.', 'leaf']
            ];

            for (const [name, category, color, description, type] of flowers) {
                await pool.query(`
                    INSERT INTO flowers (name, category, color, description, type) 
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (name) DO UPDATE SET 
                        category = EXCLUDED.category,
                        color = EXCLUDED.color,
                        description = EXCLUDED.description,
                        type = EXCLUDED.type
                `, [name, category, color, description, type]);
            }

            console.log(' Database pronto e scattante!');
            return; // Uscita dal loop se tutto ok

        } catch (error) {
            retries--;
            if (retries === 0) {
                console.error(' Database non raggiungibile dopo diversi tentativi:', error);
                throw error;
            }
            console.log(`️ DB non ancora pronto (ECONNREFUSED). Riprovo in ${delay/1000}s...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

module.exports = initDatabase;
