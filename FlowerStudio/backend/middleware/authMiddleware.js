const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. IL BUTTAFUORI STANDARD (Verifica solo se sei loggato) ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: "Accesso negato. Token mancante." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Salviamo i dati dell'utente e diamo il via libera
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(403).json({ message: "Token non valido o scaduto." });
    }
};

// --- 2. IL BUTTAFUORI VIP (Verifica se sei Admin) ---
// (Nota: questa funzione vive FUORI da verifyToken)
const verifyAdmin = (req, res, next) => {
    // req.user viene creato dal verifyToken (che passa prima di lui)
    if (req.user && req.user.role === 'admin') {
        next(); // Ok, sei il capo. Puoi passare!
    } else {
        res.status(403).json({ message: "Accesso negato. Area riservata agli Admin." });
    }
};

// Ora NodeJS le vede entrambe e le esporta senza problemi!
module.exports = { verifyToken, verifyAdmin };