const ChatService = require('../services/chatService');

const ChatController = {
    sendMessage: async (req, res) => {
        try {
            const { message } = req.body;
            
            if (!message) {
                return res.status(400).json({ error: "Il messaggio è obbligatorio." });
            }

            // RECUPERIAMO L'UTENTE DAL MIDDLEWARE
            const user = req.user; // Contiene id, email e ROLE (user o admin)

            // Passiamo sia il messaggio che i dati dell'utente al Service!
            const aiResponse = await ChatService.askAI(message, user);

            res.status(200).json({ reply: aiResponse });
            
        } catch (error) {
            console.error('Errore nel Controller della chat:', error);
            res.status(500).json({ error: "Errore interno del server durante la chat." });
        }
    }
};

module.exports = ChatController;