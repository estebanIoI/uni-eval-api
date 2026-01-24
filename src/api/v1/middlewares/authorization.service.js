const { prisma } = require('@config/prisma');
const AppError = require('@utils/AppError');

/**
 * Obtiene la configuración activa y vigente (por fecha)
 * @returns {Promise<Object|null>} Configuración cfg_t activa
 */
async function getActiveConfig() {
  try {
    const now = new Date();
    const config = await prisma.cfg_t.findFirst({
      where: {
        es_activo: true,
        fecha_inicio: { lte: now },
        fecha_fin: { gte: now },
      },
      orderBy: { fecha_actualizacion: 'desc' },
    });
    return config;
  } catch (error) {
    throw new AppError('Error al obtener configuración activa', 500, error);
  }
}

/**
 * Obtiene los roles permitidos para una configuración específica
 * @param {number} cfgTId - ID de la configuración
 * @returns {Promise<Array<{rol_origen_id:number, origen:'APP'|'AUTH'}>>}
 */
async function getAllowedRolesForConfig(cfgTId) {
  try {
    const rows = await prisma.cfg_t_rol.findMany({
      where: { cfg_t_id: cfgTId },
      select: {
        rol_mix: {
          select: { rol_origen_id: true, origen: true },
        },
      },
    });

    return rows
      .map(r => r.rol_mix)
      .filter(r => r && r.rol_origen_id != null);
  } catch (error) {
    throw new AppError('Error al obtener roles permitidos', 500, error);
  }
}

/**
 * Valida si el usuario tiene autorización basada en roles y configuración
 * @param {Object} user - Usuario desde req.user
 * @param {number|null} cfgTId - ID de configuración específica (opcional)
 * @returns {Promise<boolean>} true si está autorizado
 */
async function isUserAuthorized(user, cfgTId = null) {
  const hasAnyRoleArray = Array.isArray(user?.rolesAppIds) || Array.isArray(user?.rolesAuthIds);
  if (!user || !hasAnyRoleArray) return false;

  const config = cfgTId
    ? await prisma.cfg_t.findUnique({ where: { id: Number(cfgTId) } })
    : await getActiveConfig();

  if (!config) return false;

  const allowedRoles = await getAllowedRolesForConfig(config.id);
  if (allowedRoles.length === 0) return false;

  const userAppRoleIds = new Set((user.rolesAppIds || []).map(String));
  const userAuthRoleIds = new Set((user.rolesAuthIds || []).map(String));

  return allowedRoles.some(({ rol_origen_id, origen }) => {
    const roleId = String(rol_origen_id);
    if (origen === 'APP') return userAppRoleIds.has(roleId);
    if (origen === 'AUTH') return userAuthRoleIds.has(roleId);
    return false;
  });
}

/**
 * Devuelve información útil para depuración/logging
 * @param {Object} user - Usuario desde req.user
 */
async function getUserAuthorizationInfo(user) {
  const config = await getActiveConfig();
  if (!config) {
    return {
      hasActiveConfig: false,
      rolesAppIds: user?.rolesAppIds || [],
      rolesAuthIds: user?.rolesAuthIds || [],
    };
  }

  const allowedRoles = await getAllowedRolesForConfig(config.id);
  return {
    hasActiveConfig: true,
    configId: config.id,
    allowedRoles,
    rolesAppIds: user?.rolesAppIds || [],
    rolesAuthIds: user?.rolesAuthIds || [],
  };
}

module.exports = {
  getActiveConfig,
  getAllowedRolesForConfig,
  isUserAuthorized,
  getUserAuthorizationInfo,
};
