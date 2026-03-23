const UserService = require('../services/userService');

const UserController = {
    register: async (req, res) => {
        try {
            // 1. ORA ESTRAIAMO ANCHE NOME E COGNOME DAL PACCHETTO!
            const { email, password, nome, cognome } = req.body;

            // Controllo di sicurezza di base
            if (!email || !password || !nome || !cognome) {
                return res.status(400).json({ message: "Tutti i campi (nome, cognome, email, password) sono obbligatori" });
            }

            // 2. PASSAGGIAMO I NUOVI DATI AL SERVICE
            const result = await UserService.registerUser(email, password, nome, cognome);
            
            res.status(201).json({
                message: "Utente registrato con successo!",
                user: result
            });
            
        } catch (error) {
            if (error.message === 'Utente già esistente') {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: "Errore interno del server" });
        }
    },

    // NUOVA FUNZIONE PER IL LOGIN
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email e password sono obbligatori" });
            }

            const result = await UserService.loginUser(email, password);
            
            // Restituiamo 200 OK, l'utente e il token generato
            res.status(200).json({
                message: "Login effettuato con successo!",
                user: result.user,
                token: result.token
            });
            
        } catch (error) {
            // Se le credenziali sono sbagliate restituiamo 401 (Non autorizzato)
            if (error.message === 'Credenziali non valide') {
                return res.status(401).json({ message: error.message });
            }
            res.status(500).json({ message: "Errore interno del server" });
        }
    }
};

module.exports = UserController;