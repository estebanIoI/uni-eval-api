const { Router } = require('express');
const controller = require('./cfg-t.controller');
const { ensureAuth } = require('@middlewares/auth.middleware');
const { requireAuthorization } = require('@middlewares/authorization.middleware');

const router = Router();

// GET /cfg/t -> listado de configuraciones según rol del usuario
router.get('/r', ensureAuth, requireAuthorization(), controller.getCfgTList);

// GET /cfg/t/:id/a-e -> aspectos y escalas relacionados via a_e
router.get('/:id/a-e', ensureAuth, requireAuthorization(), controller.getAspectosEscalas);

module.exports = router;
