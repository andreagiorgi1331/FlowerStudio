const express = require('express');
const router = express.Router();
const BouquetController = require('../controllers/bouquetController');

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ROTTA PROTETTA: prima controlliamo il token, POI creiamo il bouquet
router.post('/', verifyToken, BouquetController.createBouquet);
router.put('/:id/toggle-template', verifyToken, verifyAdmin, BouquetController.toggleTemplateStatus);

// LA NUOVA ROTTA GET (per leggere)
// Anche questa è protetta dal verifyToken!
router.get('/', verifyToken, BouquetController.getUserBouquets);
router.get('/catalog/templates', verifyToken, BouquetController.getTemplates);

// ===== ROTTE ADMIN (protette da verifyToken + verifyAdmin) =====
// IMPORTANTE: devono stare PRIMA di /:id altrimenti Express interpreta "admin" come un ID!
router.get('/admin/all', verifyToken, verifyAdmin, BouquetController.getAllBouquets);
router.delete('/admin/:id', verifyToken, verifyAdmin, BouquetController.adminDeleteBouquet);

// ===== ROTTE COMMUNITY =====
router.get('/community/public', verifyToken, BouquetController.getPublicBouquets);
router.put('/:id/toggle-public', verifyToken, BouquetController.togglePublic);

// LA NUOVA ROTTA DELETE (per eliminare)
router.delete('/:id', verifyToken, BouquetController.deleteBouquet);
// LA NUOVA ROTTA PER AGGIUNGERE I FIORI (nota l'URL composto!)
router.post('/:id/flowers', verifyToken, BouquetController.addFlower);
// 1. Leggi un bouquet specifico (per l'editing)
router.get('/:id', verifyToken, BouquetController.getBouquetById);
// 2. Aggiorna un bouquet esistente (per il salvataggio modificato)
router.put('/:id', verifyToken, BouquetController.updateBouquet);

module.exports = router;