const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assets');
const { authMiddleware } = require('../middleware/auth');
const tenantScope = require('../middleware/tenant');
const requireModuleEnabled = require('../middleware/module');

router.use(authMiddleware);
router.use(tenantScope);
router.use(requireModuleEnabled('assets'));

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', assetController.createAsset);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);
router.post('/:id/assign', assetController.assignAsset);
router.post('/:id/return', assetController.returnAsset);

module.exports = router;
