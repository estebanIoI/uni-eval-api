const { prisma } = require('@config/prisma');

class CfgTRepository {
	async findAspectosEscalasByCfgTId(cfgTId) {
		const items = await prisma.a_e.findMany({
			where: { cfg_a: { cfg_t_id: cfgTId } },
			include: {
				cfg_a: {
					include: {
						ca_map: { include: { aspecto: true } }
					}
				},
				cfg_e: {
					include: {
						ce_map: { include: { escala: true } }
					}
				}
			}
		});

		// Group by aspecto and collect possible escalas with a_e id per option
		const byAspecto = new Map();
		for (const item of items) {
			const aspecto = item.cfg_a?.ca_map?.aspecto;
			if (!aspecto) continue;
			const aspectoKey = aspecto.id;
			if (!byAspecto.has(aspectoKey)) {
				byAspecto.set(aspectoKey, {
					id: aspecto.id,
					cfg_a_id: item.cfg_a?.id ?? null,
					nombre: aspecto.nombre,
					descripcion: aspecto.descripcion || null,
					orden: item.cfg_a?.orden ?? null,
					es_activo: item.cfg_a?.es_activo ?? true,
					es_cmt: item.es_cmt ?? false,
					es_cmt_oblig: item.es_cmt_oblig ?? false,
					opciones: [] // escalas/respuestas por pregunta
				});
			}
			const escala = item.cfg_e?.ce_map?.escala || null;
			const opcion = escala
				? {
						id: escala.id,
						sigla: escala.sigla,
						nombre: escala.nombre,
						descripcion: escala.descripcion || null,
						orden: item.cfg_e?.orden ?? null,
						puntaje: item.cfg_e?.puntaje ?? null,
						a_e_id: item.id,
					}
				: {
						id: null,
						sigla: null,
						nombre: null,
						descripcion: null,
						orden: null,
						puntaje: null,
						a_e_id: item.id,
					};

			byAspecto.get(aspectoKey).opciones.push(opcion);
		}

		// Return ordered list by cfg_a.orden if available
		const result = Array.from(byAspecto.values()).sort((a, b) => {
			const ao = a.orden ?? 0;
			const bo = b.orden ?? 0;
			return ao === bo ? a.id - b.id : ao - bo;
		});

		// Sort opciones (escalas) inside each aspecto by cfg_e.orden ascending
		for (const aspecto of result) {
			if (Array.isArray(aspecto.opciones)) {
				aspecto.opciones.sort((o1, o2) => {
					const a = o1.orden ?? 0;
					const b = o2.orden ?? 0;
					return a === b ? (o1.id ?? 0) - (o2.id ?? 0) : a - b;
				});
			}
		}

		return result;
	}

	async findCfgAAndCfgEByCfgTId(cfgTId) {
		const [cfgAs, cfgEs] = await Promise.all([
			prisma.cfg_a.findMany({
				where: { cfg_t_id: cfgTId },
				include: { ca_map: { include: { aspecto: true } } },
				orderBy: { orden: 'asc' },
			}),
			prisma.cfg_e.findMany({
				where: { cfg_t_id: cfgTId },
				include: { ce_map: { include: { escala: true } } },
				orderBy: { orden: 'asc' },
			}),
		]);

		return {
			cfg_a: cfgAs.map(item => ({
				id: item.id,
				cfg_t_id: item.cfg_t_id,
				aspecto_id: item.aspecto_id,
				orden: item.orden,
				es_activo: item.es_activo ?? true,
				aspecto: item.ca_map?.aspecto
					? {
							id: item.ca_map.aspecto.id,
							nombre: item.ca_map.aspecto.nombre,
							descripcion: item.ca_map.aspecto.descripcion || null,
					  }
					: null,
			})),
			cfg_e: cfgEs.map(item => ({
				id: item.id,
				cfg_t_id: item.cfg_t_id,
				escala_id: item.escala_id,
				puntaje: item.puntaje,
				orden: item.orden,
				es_activo: item.es_activo ?? true,
				escala: item.ce_map?.escala
					? {
							id: item.ce_map.escala.id,
							sigla: item.ce_map.escala.sigla,
							nombre: item.ce_map.escala.nombre,
							descripcion: item.ce_map.escala.descripcion || null,
					  }
					: null,
			})),
		};
	}

	async findCfgTListByUserRoles(userAppRoleIds = [], userAuthRoleIds = [], isAdmin = false) {
		if (isAdmin) {
			return this.#getAllCfgTs();
		}
		return this.#getCfgTsByUserRoles(userAppRoleIds, userAuthRoleIds);
	}

	async #getAllCfgTs() {
		const allCfgTs = await prisma.cfg_t.findMany({
			include: { ct_map: true },
			orderBy: { fecha_actualizacion: 'desc' },
		});
		return allCfgTs.map(cfgT => this.#mapCfgT(cfgT));
	}

	async #getCfgTsByUserRoles(userAppRoleIds = [], userAuthRoleIds = []) {
		const cfgTRoles = await prisma.cfg_t_rol.findMany({
			include: {
				cfg_t: { include: { ct_map: true } },
				rol_mix: true,
			},
		});

		const cfgTMap = new Map();
		for (const cfgTRol of cfgTRoles) {
			const { cfg_t: cfgT, rol_mix } = cfgTRol;
			if (!cfgTMap.has(cfgT.id)) {
				cfgTMap.set(cfgT.id, {
					...this.#mapCfgT(cfgT),
					rolesRequeridos: [],
				});
			}
			if (rol_mix) {
				cfgTMap.get(cfgT.id).rolesRequeridos.push({
					rol_mix_id: rol_mix.id,
					rol_origen_id: rol_mix.rol_origen_id,
					origen: rol_mix.origen,
				});
			}
		}

		const userAppRoleIdsSet = new Set((userAppRoleIds || []).map(String));
		const userAuthRoleIdsSet = new Set((userAuthRoleIds || []).map(String));

		return Array.from(cfgTMap.values())
			.filter(cfgT =>
				cfgT.rolesRequeridos.some(({ rol_origen_id, origen }) => {
					const roleId = String(rol_origen_id);
					return origen === 'APP' ? userAppRoleIdsSet.has(roleId) : userAuthRoleIdsSet.has(roleId);
				})
			)
			.sort((a, b) => new Date(b.fecha_actualizacion) - new Date(a.fecha_actualizacion));
	}

	#mapCfgT(cfgT) {
		return {
			id: cfgT.id,
			tipo_evaluacion_id: cfgT.tipo_evaluacion_id,
			tipo_evaluacion: cfgT.ct_map?.nombre || null,
			fecha_inicio: cfgT.fecha_inicio,
			fecha_fin: cfgT.fecha_fin,
			es_cmt_gen: cfgT.es_cmt_gen,
			es_cmt_gen_oblig: cfgT.es_cmt_gen_oblig,
			es_activo: cfgT.es_activo,
			fecha_creacion: cfgT.fecha_creacion,
			fecha_actualizacion: cfgT.fecha_actualizacion,
		};
	}
}

module.exports = CfgTRepository;
