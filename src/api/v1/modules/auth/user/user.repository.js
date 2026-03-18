const { userPrisma } = require('@config/prisma'); 

class UserRepository {
  constructor() {
    this.model = userPrisma.vista_academica_insitus;
  }

  findMateriasByEstudiante(ID_ESTUDIANTE) {
    return this.model.findMany({
      where: { ID_ESTUDIANTE },
      orderBy: { PERIODO: 'asc' }
    });
  }

  findMateriasByDocente(ID_DOCENTE) {
    return this.model.findMany({
      where: { ID_DOCENTE },
      orderBy: { PERIODO: 'asc' }
    });
  }
}

module.exports = UserRepository;
