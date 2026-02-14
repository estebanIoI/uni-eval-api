const { Router } = require('express');
const controller = require('./cfg-t.controller');
const { ensureAuth, requireAuthRoles, requireAppRoles } = require('@middlewares/auth.middleware');
const { requireAuthorization } = require('@middlewares/authorization.middleware');
const search = require('@middlewares/http/search');
const sort = require('@middlewares/http/sort');

const router = Router();

// GET /cfg/t -> listado de configuraciones según rol del usuario
router.get('/r', 
  ensureAuth, 
  requireAuthorization(), 
  search({ searchFields: ['nombre', 'descripcion'], minLength: 2 }),
  sort({ defaultSortBy: 'id', defaultSortOrder: 'asc', allowedFields: ['id', 'nombre', 'fecha_inicio'] }),
  controller.getCfgTList
);

// GET /cfg/t/:id/a-e -> aspectos y escalas relacionados via a_e
router.get('/:id/a-e', ensureAuth, requireAuthRoles(1), controller.getAspectosEscalas);

// GET /cfg/t/cfg-a_cfg-e -> todas las configuraciones de cfg_a y cfg_e
router.get('/cfg-a_cfg-e', ensureAuth, requireAuthorization(), controller.getCfgAAndCfgE);

// GET /cfg/t/:id/cfg-a_cfg-e -> configuración de cfg_a y cfg_e por id
router.get('/:id/cfg-a_cfg-e', ensureAuth, requireAuthorization(), controller.getCfgAAndCfgE);

// GET /cfg/t/:id/roles -> roles asignados a una cfg_t
router.get('/:id/roles', ensureAuth, requireAuthorization(), controller.getRoles);

// GET /cfg/t/:id/evals -> evaluaciones/encuestas del usuario autenticado
router.get('/:id/evals', ensureAuth, requireAuthorization(req => Number(req.params.id)), controller.getEvaluacionesByCfgTUser);

module.exports = router;
