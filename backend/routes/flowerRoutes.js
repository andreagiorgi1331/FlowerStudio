const express = require('express');
const router = express.Router();
const FlowerController = require('../controllers/flowerController');

// Assicurati che ci sia solo la barra '/' qui dentro
router.get('/', FlowerController.getAllFlowers);

// Questa riga finale è FONDAMENTALE per far leggere il file al server.js!
module.exports = router;