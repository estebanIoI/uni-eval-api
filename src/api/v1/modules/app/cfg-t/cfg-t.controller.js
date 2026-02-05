const { successResponse } = require('@utils/responseHandler');
const CfgTService = require('./cfg-t.service');
const CfgTRepository = require('./cfg-t.repository');

const service = new CfgTService(new CfgTRepository());

class CfgTController {
	getCfgTList = async (req, res, next) => {
		try {
			const data = await service.getCfgTList(req.user);
			return successResponse(res, {
				message: 'Listado de configuraciones obtenido correctamente',
				data,
			});
		} catch (err) {
			next(err);
		}
	};

	getAspectosEscalas = async (req, res, next) => {
		try {
			const cfgTId = Number(req.params.id);
			const data = await service.getAspectosEscalas(cfgTId);
			return successResponse(res, { message: 'Aspectos y escalas obtenidos', data });
		} catch (err) {
			next(err);
		}
	};

	getCfgAAndCfgE = async (req, res, next) => {
		try {
			const cfgTId = Number(req.params.id);
			const data = await service.getCfgAAndCfgE(cfgTId);
			return successResponse(res, { message: 'Configuración cfg_a y cfg_e obtenida', data });
		} catch (err) {
			next(err);
		}
	};

	getRoles = async (req, res, next) => {
		try {
			const cfgTId = Number(req.params.id);
			const data = await service.getRolesByCfgT(cfgTId);
			return successResponse(res, { message: 'Roles obtenidos correctamente', data });
		} catch (err) {
			next(err);
		}
	};

	getEvaluacionesByCfgTUser = async (req, res, next) => {
		try {
			const cfgTId = Number(req.params.id);
			const data = await service.getEvaluacionesByCfgT(cfgTId, req.user);
			return successResponse(res, { message: 'Evaluaciones obtenidas correctamente', data });
		} catch (err) {
			next(err);
		}
	};
}

module.exports = new CfgTController();
