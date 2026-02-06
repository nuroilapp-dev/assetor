const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const tenantScope = require('../middleware/tenant');

// Global middleware for this route
router.use(authMiddleware);
router.use(requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']));
router.use(tenantScope);

// Routes
router.get('/premises', officeController.getPremises);
router.post('/premises', officeController.createPremise);
router.post('/upload', officeController.uploadFile);
router.get('/premises/:id', officeController.getPremiseById);
router.put('/premises/:id', officeController.updatePremise);
router.delete('/premises/:id', officeController.deletePremise);
router.post('/premises/:id/documents', officeController.addPremiseDocument);
router.get('/property-types', officeController.getPropertyTypes);

module.exports = router;
