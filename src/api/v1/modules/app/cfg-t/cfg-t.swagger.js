/**
 * @swagger
 * tags:
 *   - name: Configuración Tipo
 *     description: Endpoints para obtener información relacionada a configuraciones tipo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CfgT:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tipo_evaluacion_id:
 *           type: integer
 *         tipo_evaluacion:
 *           type: string
 *           nullable: true
 *         fecha_inicio:
 *           type: string
 *           format: date
 *         fecha_fin:
 *           type: string
 *           format: date
 *         es_cmt_gen:
 *           type: boolean
 *         es_cmt_gen_oblig:
 *           type: boolean
 *         es_activo:
 *           type: boolean
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *         rolesRequeridos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rol_mix_id:
 *                 type: integer
 *               rol_origen_id:
 *                 type: integer
 *               origen:
 *                 type: string
 *                 enum: [APP, AUTH]
 *
 *     CfgTListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Listado de configuraciones obtenido correctamente
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CfgT'
 *
 *     AERelacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         es_cmt:
 *           type: boolean
 *         es_cmt_oblig:
 *           type: boolean
 *         aspecto:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             descripcion:
 *               type: string
 *               nullable: true
 *         escala:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             sigla:
 *               type: string
 *             nombre:
 *               type: string
 *             descripcion:
 *               type: string
 *               nullable: true
 *
 *     AEResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Listado obtenido correctamente
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AERelacion'
 */

/**
 * @swagger
 * /cfg/t/r:
 *   get:
 *     summary: Obtiene listado de configuraciones según rol del usuario
 *     tags: [Configuración Tipo]
 *     responses:
 *       200:
 *         description: Listado de configuraciones accesibles al usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CfgTListResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin autorización (no tiene rol requerido)
 */

/**
 * @swagger
 * /cfg/t/{id}/a-e:
 *   get:
 *     summary: Obtiene aspectos y escalas relacionados vía a_e
 *     tags: [Configuración Tipo]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de cfg_t
 *     responses:
 *       200:
 *         description: Listado de relaciones a_e
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AEResponse'
 *       400:
 *         description: Solicitud inválida
 *       404:
 *         description: No encontrado
 */
