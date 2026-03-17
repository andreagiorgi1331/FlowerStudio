const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/register', UserController.register);
// NUOVA ROTTA PER IL LOGIN
router.post('/login', UserController.login);

module.exports = router;