// Se ejecuta antes de importar AppModule (ConfigModule lee el entorno al importar).
// AUTH_ENABLED=false activa un usuario simulado con los headers x-dev-email /
// x-dev-admin, así se prueban permisos sin hablar con Firebase.
process.env.AUTH_ENABLED = 'false';
process.env.SWAGGER_ENABLED = 'false';
process.env.DB_SYNCHRONIZE = 'true';
process.env.DB_LOGGING = 'false';

if (process.env.E2E_DB === 'postgres') {
  process.env.DB_TYPE = 'postgres';
} else {
  process.env.DB_TYPE = 'sqlite';
  process.env.DB_DATABASE = ':memory:';
}
