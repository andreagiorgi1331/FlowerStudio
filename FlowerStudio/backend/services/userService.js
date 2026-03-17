const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const UserService = {
    registerUser: async (email, password, nome, cognome) => {
        
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) throw new Error('Email già in uso');
        const hashedPassword = await bcrypt.hash(password, 10);
        return await UserModel.createUser(email, hashedPassword, nome, cognome);
        
    },

    loginUser: async (email, password) => {
        try {
            // 1. Cerchiamo l'utente nel database
            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw new Error('Credenziali non valide');
            }

            // 2. Confrontiamo la password inserita con quella criptata nel DB
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Credenziali non valide');
            }

            // 3. Se è tutto ok, generiamo il Token (il "braccialetto VIP")
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.name, cognome: user.cognome }, // Dati da inserire nel token
                process.env.JWT_SECRET,                              // La nostra firma segreta
                { expiresIn: '30d' }                                  // Scadenza del token (1 ora)
            );

            // Restituiamo l'utente (senza la password!) e il token
            delete user.password;
            return { user, token };
            
        } catch (error) {
            console.error('Errore nel Service durante il login:', error);
            throw error;
        }
    }
};

module.exports = UserService;