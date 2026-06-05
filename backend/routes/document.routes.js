const express = require('express');
const { getMyDocuments, uploadVaultDocument } = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/me', protect, getMyDocuments);
router.post('/upload', protect, upload.any(), uploadVaultDocument);

module.exports = router;
