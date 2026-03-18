const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const DataloginRepository = require('./datalogin.repository');
const DataloginService = require('./datalogin.service');
const DataloginController = require('./datalogin.controller');
const { ensureAuth, requireGlobalRole } = require('@middlewares/auth.middleware');

const repository = new DataloginRepository();
const service = new DataloginService(repository);
const controller = new DataloginController(service);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ventana de 15 minutos
  max: 10,                   // máximo 10 intentos por IP en esa ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' }
});

const router = Router();

router.get('/', ensureAuth, requireGlobalRole, controller.getAll);
router.get('/id/:id', ensureAuth, requireGlobalRole, controller.getById); // Evitar conflicto con /username
router.get('/username/:username', ensureAuth, requireGlobalRole, controller.getByUsername);

// Auth
router.post('/login', loginLimiter, controller.login);
router.post('/refresh', controller.refresh); // no requiere JWT
router.post('/logout', ensureAuth, controller.logout); // requiere JWT para identificar user

module.exports = router;
