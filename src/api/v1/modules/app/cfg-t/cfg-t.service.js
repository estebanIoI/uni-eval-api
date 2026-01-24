class CfgTService {
	constructor(repository) {
		this.repository = repository;
	}

	getAspectosEscalas(cfgTId) {
		return this.repository.findAspectosEscalasByCfgTId(cfgTId);
	}

	getCfgTList(user) {
		const userAppRoleIds = user?.rolesAppIds || [];
		const userAuthRoleIds = user?.rolesAuthIds || [];
		return this.repository.findCfgTListByUserRoles(userAppRoleIds, userAuthRoleIds);
	}
}

module.exports = CfgTService;
