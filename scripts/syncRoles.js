require('dotenv').config();
require('module-alias/register');

const { initializeDatabase, localPrisma } = require('@db');
const RolRepository = require('../src/api/v1/modules/auth/rol/rol.repository');
const RolService = require('../src/api/v1/modules/auth/rol/rol.service');

async function fetchRolesMix() {
  console.log('[sync-roles] Obteniendo roles mixtos directamente del servicio...');
  
  const repository = new RolRepository();
  const service = new RolService(repository);
  
  const roles = await service.getMixedRolesOnline();
  
  if (!Array.isArray(roles)) {
    throw new Error('El servicio no retornó un array válido');
  }

  return roles;
}

async function upsertRolMix({ id, nombre, tipo_participacion }) {
  const origen = String(tipo_participacion || '').trim().toUpperCase();
  const rol_origen_id = Number(id);
  const nombreSafe = String(nombre || '').trim();

  if (!rol_origen_id || !nombreSafe || !origen) {
    throw new Error('Registro inválido: faltan campos requeridos');
  }

  // Parametrizado con Prisma para evitar inyecciones
  const sql = 'INSERT INTO rol_mix (rol_origen_id, nombre, origen) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), origen = VALUES(origen)';
  await localPrisma.$executeRaw`INSERT INTO rol_mix (rol_origen_id, nombre, origen) VALUES (${rol_origen_id}, ${nombreSafe}, ${origen}) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), origen = VALUES(origen)`;
  return sql;
}

async function run() {
  console.log('[sync-roles] Iniciando sincronización de roles mix...');
  try {
    await initializeDatabase();

    const roles = await fetchRolesMix();
    console.log(`[sync-roles] Roles recibidos: ${roles.length}`);

    let ok = 0;
    let fail = 0;
    let lastSql = '';

    for (const item of roles) {
      try {
        lastSql = await upsertRolMix(item);
        ok += 1;
        console.log(`[sync-roles] Upsert OK: id=${item.id}, nombre=${item.nombre}, origen=${item.tipo_participacion}`);
      } catch (e) {
        fail += 1;
        console.error(`[sync-roles] Error con id=${item.id}: ${e.message}`);
      }
    }

    console.log('---');
    console.log(`[sync-roles] Finalizado. OK: ${ok}, Errores: ${fail}`);
    if (lastSql) {
      console.log('[sync-roles] SQL usado para inserción:');
      console.log(lastSql);
    }
  } catch (e) {
    console.error('[sync-roles] Falló la sincronización:', e.message);
    process.exitCode = 1;
  } finally {
    try {
      await localPrisma.$disconnect();
    } catch {}
  }
}

if (require.main === module) {
  run();
}
