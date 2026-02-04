const express = require('express');
const router = express.Router();
const moduleSectionsController = require('../controllers/moduleSections');
const { authMiddleware, requireRole } = require('../middleware/auth');
const tenantScope = require('../middleware/tenant');

// All routes here are under /api/module-sections
router.use(authMiddleware);
router.use(tenantScope);
router.use(requireRole(['SUPER_ADMIN', 'COMPANY_ADMIN']));

router.get('/', moduleSectionsController.listModuleSections);
router.post('/', moduleSectionsController.createModuleSection);
router.put('/:id', moduleSectionsController.updateModuleSection);
router.delete('/:id', moduleSectionsController.deleteModuleSection);

module.exports = router;
