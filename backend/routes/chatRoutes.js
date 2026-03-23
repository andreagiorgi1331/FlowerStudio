const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

// ROTTA PROTETTA: POST /chat
router.post('/', verifyToken, ChatController.sendMessage);

module.exports = router;