const { Router } = require('express');
const UserRolRepository = require('./user-rol.repository');
const UserRolService = require('./user-rol.service');
const UserRolController = require('./user-rol.controller');
const pagination = require('@middlewares/pagination');
const { ensureAuth, requireGlobalRole } = require('@middlewares/auth.middleware');

const repository = new UserRolRepository();
const service = new UserRolService(repository);
const controller = new UserRolController(service);

const router = Router();

router.get('/u', ensureAuth, requireGlobalRole, pagination({ maxLimit: 100 }), controller.getUserRolesWithDataLogin);

module.exports = router;
