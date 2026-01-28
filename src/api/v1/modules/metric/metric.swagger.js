/**
 * @swagger
 * /metric/evaluations/docente/{docente}/report.docx:
 *   get:
 *     summary: Genera y descarga reporte DOCX del docente desde eval y eval_det
 *     description: Genera un documento Word con métricas, conclusiones y análisis de IA para el docente. Obtiene datos directamente de eval (conclusión general, fortalezas, debilidades) y eval_det (conclusiones por aspecto). Soporta filtros estándar.
 *     tags: [Metric]
 *     parameters:
 *       - in: path
 *         name: docente
 *         required: true
 *         schema:
 *           type: string
 *         description: ID/código del docente
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la configuración de evaluación
 *       - in: query
 *         name: codigo_materia
 *         required: false
 *         schema:
 *           type: string
 *         description: Si se proporciona, filtra el reporte a una materia específica
 *       - in: query
 *         name: sede
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por sede
 *       - in: query
 *         name: periodo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por período
 *       - in: query
 *         name: programa
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por programa académico
 *       - in: query
 *         name: semestre
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por semestre
 *       - in: query
 *         name: grupo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por grupo
 *     responses:
 *       200:
 *         description: Archivo Word generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros requeridos faltantes o inválidos
 *       404:
 *         description: No hay evaluaciones para este docente/materia
 */

/**
 * @swagger
 * /metric/evaluations/docente/{docente}/aspectos:
 *   get:
 *     summary: Métricas por aspecto para un docente (opcionalmente filtrado por materia)
 *     description: |
 *       Retorna métricas desagregadas por aspecto para un docente.
 *       Si se proporciona codigo_materia, filtra solo a esa materia.
 *       Si no, retorna métricas de TODAS las materias del docente.
 *     tags: [Metric]
 *     parameters:
 *       - in: path
 *         name: docente
 *         required: true
 *         schema:
 *           type: string
 *         description: ID/código del docente
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la configuración de evaluación
 *       - in: query
 *         name: codigo_materia
 *         required: false
 *         schema:
 *           type: string
 *         description: Código de la materia (opcional). Si se proporciona, filtra métricas a esa materia.
 *       - in: query
 *         name: sede
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por sede
 *       - in: query
 *         name: periodo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por período
 *       - in: query
 *         name: programa
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por programa académico
 *       - in: query
 *         name: semestre
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por semestre
 *       - in: query
 *         name: grupo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por grupo
 *     responses:
 *       200:
 *         description: Métricas por aspecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docente:
 *                   type: string
 *                   example: "79864589"
 *                 codigo_materia:
 *                   type: string
 *                   nullable: true
 *                   description: Código de la materia (null si no se filtró por materia)
 *                   example: null
 *                 suma_total:
 *                   type: number
 *                   description: Suma total de puntajes
 *                   example: 11.5
 *                 total_respuestas:
 *                   type: integer
 *                   description: Total de respuestas recolectadas
 *                   example: 8
 *                 promedio:
 *                   type: number
 *                   nullable: true
 *                   description: Promedio general (null si no hay aspectos con escala)
 *                   example: 1.4375
 *                 desviacion:
 *                   type: number
 *                   nullable: true
 *                   description: Desviación estándar
 *                   example: 0.726
 *                 aspectos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       aspecto_id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         nullable: true
 *                         example: "Dominio del tema"
 *                       total_respuestas:
 *                         type: integer
 *                         example: 1
 *                       suma:
 *                         type: number
 *                         example: 2
 *                       promedio:
 *                         type: number
 *                         nullable: true
 *                         example: 2
 *                       desviacion:
 *                         type: number
 *                         nullable: true
 *                         example: 0
 *       400:
 *         description: Parámetros requeridos faltantes o inválidos
 *       404:
 *         description: No hay evaluaciones para este docente/materia
 */
/**
 * @swagger
 * /metric/evaluations/docente/{docente}/comments/analysis:
 *   get:
 *     summary: Analiza comentarios con IA por materia y actualiza conclusiones en la BD
 *     description: |
 *       Obtiene comentarios para cada materia del docente, los analiza con IA usando Ollama, 
 *       y actualiza conclusion_gen, fortalezas, debilidades en eval y conclusion en eval_det.
 *       
 *       Si se especifica codigo_materia, solo analiza esa materia.
 *       Si no, analiza TODAS las materias por SEPARADO (sin mezclar comentarios entre ellas).
 *     tags: [Metric]
 *     parameters:
 *       - in: path
 *         name: docente
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigo_materia
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docente:
 *                   type: string
 *                 total_respuestas:
 *                   type: integer
 *                 analisis:
 *                   type: object
 *                   properties:
 *                     conclusion_general:
 *                       type: string
 *                     aspectos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           aspecto:
 *                             type: string
 *                           conclusion:
 *                             type: string
 *                     fortalezas:
 *                       type: array
 *                       items:
 *                         type: string
 *                     debilidades:
 *                       type: array
 *                       items:
 *                         type: string
 */
/**
 * @swagger
 * /metric/evaluations/docente/{docente}/materias:
 *   get:
 *     summary: Per-materia metrics for a docente
 *     description: Retorna métricas por materia del docente. Si se proporciona codigo_materia, filtra solo esa materia. Si no, retorna todas las materias.
 *     tags: [Metric]
 *     parameters:
 *       - in: path
 *         name: docente
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigo_materia
 *         required: false
 *         schema:
 *           type: string
 *         description: Código de la materia (opcional). Si se proporciona, filtra solo esa materia.
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Per-subject metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docente:
 *                   type: string
 *                 materias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       codigo_materia:
 *                         type: string
 *                       nombre_materia:
 *                         type: string
 *                       total_evaluaciones:
 *                         type: integer
 *                       total_realizadas:
 *                         type: integer
 *                       total_pendientes:
 *                         type: integer
 *                       suma:
 *                         type: number
 */

/**
 * @swagger
 * /metric/evaluations/docente/{docente}/materias/{codigo_materia}/completion:
 *   get:
 *     summary: Students who completed vs pending for a specific subject
 *     tags: [Metric]
 *     parameters:
 *       - in: path
 *         name: docente
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: codigo_materia
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Completion lists with student names grouped by GRUPO
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docente:
 *                   type: string
 *                   example: "79579499"
 *                 codigo_materia:
 *                   type: string
 *                   example: "6665"
 *                 grupos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       grupo:
 *                         type: string
 *                         example: "A"
 *                       completados:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             nombre:
 *                               type: string
 *                       pendientes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             nombre:
 *                               type: string
 */
/**
 * @swagger
 * tags:
 *   name: Metric
 *   description: Real-time evaluation metrics
 */

/**
 * @swagger
 * /metric/evaluations/summary:
 *   get:
 *     summary: Summary metrics for evaluations
 *     tags: [Metric]
 *     parameters:
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *         description: Configuration ID (e.g., 1)
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Summary metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generales:
 *                   type: object
 *                   properties:
 *                     total_evaluaciones:
 *                       type: integer
 *                     total_realizadas:
 *                       type: integer
 *                     total_evaluaciones_registradas:
 *                       type: integer
 *                       description: Total evaluations registered in local (cfg_t)
 *                     total_pendientes:
 *                       type: integer
 *                     total_estudiantes:
 *                       type: integer
 *                     total_estudiantes_registrados:
 *                       type: integer
 *                       description: Unique students who loaded courses (from local eval)
 *                     total_estudiantes_pendientes:
 *                       type: integer
 *                     total_docentes:
 *                       type: integer
 *                     total_docentes_pendientes:
 *                       type: integer
 *       400:
 *         description: Invalid parameters
 */

/**
 * @swagger
 * /metric/evaluations/summary/programas:
 *   get:
 *     summary: Summary metrics grouped by program and group
 *     description: Retorna métricas agregadas por programa académico y sus grupos, usando la lógica de resumen general.
 *     tags: [Metric]
 *     parameters:
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la configuración de evaluación
 *       - in: query
 *         name: sede
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por sede
 *       - in: query
 *         name: periodo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por período
 *       - in: query
 *         name: semestre
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por semestre
 *     responses:
 *       200:
 *         description: Métricas por programa y grupo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 programas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                       metricas:
 *                         type: object
 *                         properties:
 *                           total_evaluaciones:
 *                             type: integer
 *                           total_evaluaciones_registradas:
 *                             type: integer
 *                           total_realizadas:
 *                             type: integer
 *                           total_pendientes:
 *                             type: integer
 *                           total_estudiantes:
 *                             type: integer
 *                           total_estudiantes_registrados:
 *                             type: integer
 *                           total_estudiantes_pendientes:
 *                             type: integer
 *                           total_docentes:
 *                             type: integer
 *                           total_docentes_pendientes:
 *                             type: integer
 *                       grupos:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             grupo:
 *                               type: string
 *                             metricas:
 *                               type: object
 *                               properties:
 *                                 total_evaluaciones:
 *                                   type: integer
 *                                 total_evaluaciones_registradas:
 *                                   type: integer
 *                                 total_realizadas:
 *                                   type: integer
 *                                 total_pendientes:
 *                                   type: integer
 *                                 total_estudiantes:
 *                                   type: integer
 *                                 total_estudiantes_registrados:
 *                                   type: integer
 *                                 total_estudiantes_pendientes:
 *                                   type: integer
 *                                 total_docentes:
 *                                   type: integer
 *                                 total_docentes_pendientes:
 *                                   type: integer
 *       400:
 *         description: Invalid parameters
 */

/**
 * @swagger
 * /metric/evaluations/ranking:
 *   get:
 *     summary: Ranking of docentes with Bayesian adjustment
 *     tags: [Metric]
 *     parameters:
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ranking list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ranking:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       docente:
 *                         type: string
 *                       avg:
 *                         type: number
 *                       adjusted:
 *                         type: number
 *                       realizados:
 *                         type: integer
 *                       universo:
 *                         type: integer
 */

/**
 * @swagger
 * /metric/evaluations/docente/{docente}:
 *   get:
 *     summary: Métricas generales del docente
 *     tags: [Metric]
 *     parameters:
 *       - in: path
 *         name: docente
 *         required: true
 *         schema:
 *           type: string
 *         description: ID/código del docente
 *       - in: query
 *         name: cfg_t
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sede
 *         schema:
 *           type: string
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: programa
 *         schema:
 *           type: string
 *       - in: query
 *         name: semestre
 *         schema:
 *           type: string
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Métricas del docente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docente:
 *                   type: string
 *                 promedio_general:
 *                   type: number
 *                 desviacion_general:
 *                   type: number
 *                 total_evaluaciones:
 *                   type: integer
 *                 total_realizadas:
 *                   type: integer
 *                 total_pendientes:
 *                   type: integer
 *                 total_aspectos:
 *                   type: integer
 *                 porcentaje_cumplimiento:
 *                   type: number
 *                 suma:
 *                   type: number
 */
