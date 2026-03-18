require('dotenv').config();
require('module-alias/register');

// Validar JWT_SECRET antes de iniciar
const JWT_SECRET = process.env.JWT_SECRET;
const WEAK_SECRETS = ['123456789', '1234567890', 'secret', 'password', 'jwt_secret', 'changeme'];
if (!JWT_SECRET) {
  console.error('\n[FATAL] JWT_SECRET no está definido. Configúralo en el archivo .env antes de iniciar.');
  process.exit(1);
}
if (JWT_SECRET.length < 32 || WEAK_SECRETS.includes(JWT_SECRET)) {
  if (process.env.NODE_ENV === 'production') {
    console.error('\n[FATAL] JWT_SECRET es demasiado débil o usa un valor por defecto. Usa un string aleatorio de al menos 32 caracteres en producción.');
    process.exit(1);
  } else {
    console.warn('\n[WARN] JWT_SECRET es débil. En producción esto causará un error fatal y el servidor no arrancará.\n');
  }
}

const app = require('./app');
const log = require('@config/log-messages');
const MSG = require('@constants/server-messages');

const PORT = process.env.PORT;

function printStartupMessages() {
  console.clear();
  console.log(`\n${MSG.STARTUP.TITLE}`);
  console.log(MSG.STARTUP.SEPARATOR);
  console.log(MSG.STARTUP.PORT);
  console.log(MSG.STARTUP.API_URL);
  console.log(MSG.STARTUP.SWAGGER_URL);
  console.log(MSG.STARTUP.MODE);
  console.log(MSG.STARTUP.SEPARATOR);
  console.log(`${MSG.STARTUP.STOP_HINT}\n`);
  log.info('SERVER.STARTED');
}

const server = app.listen(PORT, printStartupMessages);

process.on('unhandledRejection', (err) => {
  console.log(`\n${MSG.ERRORS.UNHANDLED_REJECTION}`);
  console.log(MSG.ERRORS.SHUTTING_DOWN);
  log.error('SERVER.ERROR', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log(`\n${MSG.ERRORS.UNCAUGHT_EXCEPTION}`);
  console.log(MSG.ERRORS.SHUTTING_DOWN);
  log.error('SERVER.ERROR', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log(`\n${MSG.SIGNALS.SIGTERM_RECEIVED}`);
  console.log(MSG.SIGNALS.SHUTTING_DOWN);
  server.close(() => {
    console.log(MSG.SIGNALS.SHUTDOWN_SUCCESS);
    process.exit(0);
  });
});