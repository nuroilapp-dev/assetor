const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companies');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.use(requireRole(['SUPER_ADMIN']));

router.get('/', companyController.getCompanies);
router.post('/', companyController.createCompany);

module.exports = router;
