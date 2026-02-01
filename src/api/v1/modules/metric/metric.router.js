const express = require('express');
const ctrl = require('./metric.controller');

const router = express.Router();

// GET /metric/evaluations/summary?cfg_t=1&...filters
router.get('/evaluations/summary', ctrl.summary);

// GET /metric/evaluations/summary/programas?cfg_t=1&...filters
router.get('/evaluations/summary/programas', ctrl.summaryByProgram);

// GET /metric/evaluations/ranking?cfg_t=1&...filters
router.get('/evaluations/ranking', ctrl.ranking);

// GET /metric/evaluations/docente?cfg_t=1&docente=...&...filters
// If docente is not provided, returns stats for all docentes
router.get('/evaluations/docentes', ctrl.docente);

// GET /metric/evaluations/docente/aspectos?cfg_t=1&docente=...&codigo_materia=...
// docente y codigo_materia son opcionales en query
// Si no se especifica docente, retorna métricas agregadas de todos los docentes
router.get('/evaluations/docentes/aspectos', ctrl.docenteAspectMetrics);

// GET /metric/evaluations/docente/:docente/materias?cfg_t=1&...filters
router.get('/evaluations/docente/:docente/materias', ctrl.docenteMateriaMetrics);

// GET /metric/evaluations/docente/:docente/materias/:codigo_materia/completion?cfg_t=1&...filters
router.get('/evaluations/docente/:docente/materias/:codigo_materia/completion', ctrl.docenteMateriaCompletion);

// GET /metric/evaluations/docente/:docente/comments?cfg_t=1&codigo_materia=6655
// Returns metrics with comments; codigo_materia is optional via query
router.get('/evaluations/docente/:docente/comments', ctrl.docenteComments);

// GET /metric/evaluations/docente/:docente/comments/analysis?cfg_t=1&codigo_materia=6655
// Runs local AI (Ollama) to summarize comments and return insightsdocenteCommentsAnalysis
router.get('/evaluations/docente/:docente/comments/analysis', ctrl.docenteCommentsAnalysis);

// GET /metric/evaluations/docente/:docente/report.docx?cfg_t=1&codigo_materia=6655&...filters
// Generates a Word report from localPrisma eval and eval_det with standard filters
router.get('/evaluations/docente/:docente/report.docx', ctrl.docenteReportDocx);

module.exports = router;
