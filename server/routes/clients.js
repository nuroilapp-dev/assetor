const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clients');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Global list and create - SUPER_ADMIN only
router.get('/kpis', requireRole(['SUPER_ADMIN']), clientController.getGlobalKpis);
router.get('/', requireRole(['SUPER_ADMIN']), clientController.getClients);
router.post('/', requireRole(['SUPER_ADMIN']), clientController.createClient);

// Specific client access - SUPER_ADMIN or COMPANY_ADMIN (checks in controller)
router.get('/:id', requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), clientController.getClientDetails);
router.put('/:id', requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']), clientController.updateClientLimits);
router.delete('/:id', requireRole(['SUPER_ADMIN']), clientController.deleteClient);

module.exports = router;
