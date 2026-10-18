const supportedDatabaseTypes = ['sqlite', 'postgres'];

type Environment = Record<string, string | undefined>;

function validateBoolean(value: string, name: string): string {
  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name} debe ser true o false`);
  }
  return value;
}

function validatePort(value: string, name: string): string {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} debe ser un puerto válido`);
  }
  return value;
}

function getRequiredValue(
  environment: Environment,
  name: string,
  reason: string,
): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`${name} es obligatorio ${reason}`);
  }
  return value;
}

export function validateEnvironment(environment: Environment): Environment {
  const databaseType = environment.DB_TYPE ?? 'sqlite';
  if (!supportedDatabaseTypes.includes(databaseType)) {
    throw new Error(`DB_TYPE no soportado: ${databaseType}`);
  }

  const isProduction = environment.NODE_ENV === 'production';

  // En producción el esquema se maneja con migraciones: synchronize queda
  // apagado por defecto porque puede alterar o borrar columnas sin avisar.
  const synchronize = validateBoolean(
    environment.DB_SYNCHRONIZE ?? (isProduction ? 'false' : 'true'),
    'DB_SYNCHRONIZE',
  );
  if (isProduction && synchronize === 'true') {
    throw new Error(
      'DB_SYNCHRONIZE=true no está permitido en producción; usa migraciones',
    );
  }

  const authEnabled = validateBoolean(
    environment.AUTH_ENABLED ?? 'true',
    'AUTH_ENABLED',
  );
  if (isProduction && authEnabled === 'false') {
    throw new Error('AUTH_ENABLED=false no está permitido en producción');
  }
  if (authEnabled === 'true') {
    getRequiredValue(
      environment,
      'FIREBASE_PROJECT_ID',
      'cuando AUTH_ENABLED=true',
    );
  }

  const validatedEnvironment: Environment = {
    ...environment,
    PORT: validatePort(environment.PORT ?? '3000', 'PORT'),
    DB_TYPE: databaseType,
    DB_SYNCHRONIZE: synchronize,
    DB_LOGGING: validateBoolean(
      environment.DB_LOGGING ?? 'false',
      'DB_LOGGING',
    ),
    AUTH_ENABLED: authEnabled,
    ALLOWED_EMAIL_DOMAIN: (
      environment.ALLOWED_EMAIL_DOMAIN ?? 'javerianacali.edu.co'
    )
      .trim()
      .toLowerCase(),
    ADMIN_EMAILS: environment.ADMIN_EMAILS ?? '',
    SWAGGER_ENABLED: validateBoolean(
      environment.SWAGGER_ENABLED ?? (isProduction ? 'false' : 'true'),
      'SWAGGER_ENABLED',
    ),
  };

  if (databaseType === 'sqlite') {
    return {
      ...validatedEnvironment,
      DB_DATABASE: environment.DB_DATABASE ?? 'data/app.sqlite',
    };
  }

  const reason = 'cuando DB_TYPE=postgres';
  return {
    ...validatedEnvironment,
    DB_HOST: getRequiredValue(environment, 'DB_HOST', reason),
    DB_PORT: validatePort(environment.DB_PORT ?? '5432', 'DB_PORT'),
    DB_USERNAME: getRequiredValue(environment, 'DB_USERNAME', reason),
    DB_PASSWORD: getRequiredValue(environment, 'DB_PASSWORD', reason),
    DB_DATABASE: getRequiredValue(environment, 'DB_DATABASE', reason),
  };
}

export function parseList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}
