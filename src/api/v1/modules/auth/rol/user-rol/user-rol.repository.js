const { localPrisma, authPrisma } = require('@config/prisma');

class UserRolRepository {
	constructor({ localClient = localPrisma, authClient = authPrisma } = {}) {
		this.localClient = localClient;
		this.authClient = authClient;
		this.model = this.localClient.user_rol;
		this.dataloginModel = this.authClient.datalogin;
	}

	async findPaginatedWithRolName({ skip = 0, limit = 10 } = {}) {
		const [items, total] = await Promise.all([
			this.model.findMany({
				skip,
				take: limit,
				orderBy: { id: 'asc' },
				select: {
					id: true,
					user_id: true,
					rol_id: true,
					fecha_creacion: true,
					fecha_actualizacion: true,
					rol: { select: { nombre: true } }
				}
			}),
			this.model.count()
		]);

		return { items, total };
	}

	async findPaginatedWithDataLogin({ skip = 0, limit = 10 } = {}) {
		const [items, total] = await Promise.all([
			this.model.findMany({
				skip,
				take: limit,
				orderBy: { id: 'asc' },
				select: {
					id: true,
					user_id: true,
					rol_id: true,
					fecha_creacion: true,
					fecha_actualizacion: true,
					rol: { select: { nombre: true } }
				}
			}),
			this.model.count()
		]);

		// Obtener datos de datalogin para cada user_id
		const userIds = items.map(item => item.user_id);
		const dataLogins = userIds.length > 0
			? await this.dataloginModel.findMany({
					where: { user_id: { in: userIds } },
					select: {
						user_id: true,
						user_name: true,
						user_username: true,
						user_email: true,
						user_idrole: true,
						user_statusid: true,
						role_name: true
					}
				})
			: [];

		// Crear mapa de datalogin por user_id
		const dataLoginMap = dataLogins.reduce((acc, dl) => {
			acc[dl.user_id] = dl;
			return acc;
		}, {});

		// Enriquecer items con datos de datalogin
		const enrichedItems = items.map(item => ({
			...item,
			datalogin: dataLoginMap[item.user_id] || null
		}));

		return { items: enrichedItems, total };
	}
}

module.exports = UserRolRepository;
