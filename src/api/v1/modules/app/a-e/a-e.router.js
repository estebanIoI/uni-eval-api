const { Router } = require('express');
const { ensureAuth, requireGlobalRole } = require('@middlewares/auth.middleware');
const controller = require('./a-e.controller');

const router = Router();

// POST /a/e/bulk -> bulk insert aspecto-escala relations
router.post('/bulk', ensureAuth, requireGlobalRole, controller.bulkUpsert);

module.exports = router;
