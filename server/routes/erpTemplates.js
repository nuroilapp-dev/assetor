const express = require('express');
const router = express.Router();
const controller = require('../controllers/erpTemplateController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.use(requireRole(['COMPANY_ADMIN', 'SUPER_ADMIN']));

// Note: module-master is intentionally left with a dash as requested in GET /api/module-master
// Templates routes moved to /modules/templates as requested in Data Contracts
router.get('/modules/templates', controller.getTemplates);
router.post('/modules/templates', controller.createTemplate);
router.post('/modules/configurations', controller.createConfiguration);
router.get('/modules/templates/:id', controller.getTemplateDetail);
router.put('/modules/templates/:id', controller.updateTemplate);
router.delete('/modules/templates/:id', controller.deleteTemplate);

module.exports = router;
