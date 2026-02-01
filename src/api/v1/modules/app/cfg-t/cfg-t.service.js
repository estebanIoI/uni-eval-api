const { hasGlobalRole } = require('@middlewares/auth.middleware');

class CfgTService {
	constructor(repository) {
		this.repository = repository;
	}

	getAspectosEscalas(cfgTId) {
		return this.repository.findAspectosEscalasByCfgTId(cfgTId);
	}

	getCfgAAndCfgE(cfgTId) {
		return this.repository.findCfgAAndCfgEByCfgTId(cfgTId);
	}

	getCfgTList(user) {
		const userAppRoleIds = user?.rolesAppIds || [];
		const userAuthRoleIds = user?.rolesAuthIds || [];
		const isAdmin = hasGlobalRole(user);
		return this.repository.findCfgTListByUserRoles(userAppRoleIds, userAuthRoleIds, isAdmin);
	}
}

module.exports = CfgTService;
