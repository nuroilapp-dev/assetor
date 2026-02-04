const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const { authMiddleware } = require('../middleware/auth');
const tenantScope = require('../middleware/tenant');

router.use(authMiddleware);
router.use(tenantScope);

router.get('/summary', dashboardController.getSummary);
router.get('/charts', dashboardController.getCharts);
router.get('/recent-assets', dashboardController.getRecentAssets);

module.exports = router;
