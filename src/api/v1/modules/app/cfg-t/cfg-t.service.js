const AppError = require('@utils/AppError');
const MESSAGES = require('@constants/messages');
const { hasGlobalRole } = require('@middlewares/auth.middleware');

class CfgTService {
	constructor(repository) {
		this.repository = repository;
	}

	getAspectosEscalas(cfgTId) {
		return this.repository.findAspectosEscalasByCfgTId(cfgTId);
	}

	getCfgAAndCfgE(cfgTId) {
		if (!cfgTId) {
			return this.repository.findAllCfgAAndCfgE();
		}
		return this.repository.findCfgAAndCfgEByCfgTId(cfgTId);
	}

	getCfgTList(user, search, sort) {
		const userAppRoleIds = user?.rolesAppIds || [];
		const userAuthRoleIds = user?.rolesAuthIds || [];
		const isAdmin = hasGlobalRole(user);
		const authRoleIdsSet = new Set((userAuthRoleIds || []).map(String));
		const isDocente = authRoleIdsSet.has('2');
		const isEstudiante = authRoleIdsSet.has('1');
		return this.repository.findCfgTListByUserRoles(userAppRoleIds, userAuthRoleIds, isAdmin, isDocente, isEstudiante, search, sort);
	}

	getRolesByCfgT(cfgTId) {
		return this.repository.findRolesByCfgTId(cfgTId);
	}

	getRoleFlags(user) {
		const { roles = [], rolesAuth = [], rolesApp = [] } = user || {};
		const all = new Set([...(roles || []), ...(rolesAuth || []), ...(rolesApp || [])].filter(Boolean));

		const ROLES_ESTUDIANTE = new Set(['Estudiante']);
		const ROLES_DOCENTE = new Set([
			'Docente',
			'docente_planta',
			'docente_catedra',
			'docente_planta_tc',
			'docente_planta_mt',
			'docente_planta_tiempo_completo',
			'docente_planta_medio_tiempo'
		]);

		const isDocente = [...all].some(r => ROLES_DOCENTE.has(r));
		const isEstudiante = [...all].some(r => ROLES_ESTUDIANTE.has(r));
		return { isDocente, isEstudiante };
	}

	async getEvaluacionesByCfgT(cfgTId, user) {
		if (!user) throw new AppError(MESSAGES.GENERAL.AUTHORIZATION.UNAUTHORIZED, 401);
		if (!cfgTId) throw new AppError(MESSAGES.GENERAL.VALIDATION.MISSING_FIELDS, 400);

		const currentUsername = user?.username;
		if (!currentUsername) throw new AppError(MESSAGES.GENERAL.VALIDATION.INVALID_REQUEST, 400);

		const { isDocente, isEstudiante } = this.getRoleFlags(user);
		if (!isDocente && !isEstudiante)
			throw new AppError(MESSAGES.GENERAL.AUTHORIZATION.FORBIDDEN, 403);

		return this.repository.findEvaluacionesByCfgTAndUser(cfgTId, currentUsername, { isDocente, isEstudiante });
	}
}

module.exports = CfgTService;
