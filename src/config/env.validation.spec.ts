import { parseList, validateEnvironment } from './env.validation';

const base = { FIREBASE_PROJECT_ID: 'come-jave' };

describe('validateEnvironment', () => {
  it('aplica valores por defecto seguros en desarrollo', () => {
    const env = validateEnvironment({ ...base });
    expect(env).toMatchObject({
      PORT: '3000',
      DB_TYPE: 'sqlite',
      DB_SYNCHRONIZE: 'true',
      AUTH_ENABLED: 'true',
      SWAGGER_ENABLED: 'true',
      ALLOWED_EMAIL_DOMAIN: 'javerianacali.edu.co',
    });
  });

  it('en producción apaga synchronize y swagger por defecto', () => {
    const env = validateEnvironment({ ...base, NODE_ENV: 'production' });
    expect(env.DB_SYNCHRONIZE).toBe('false');
    expect(env.SWAGGER_ENABLED).toBe('false');
  });

  it('en producción no permite synchronize ni auth desactivada', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        NODE_ENV: 'production',
        DB_SYNCHRONIZE: 'true',
      }),
    ).toThrow('DB_SYNCHRONIZE');
    expect(() =>
      validateEnvironment({ NODE_ENV: 'production', AUTH_ENABLED: 'false' }),
    ).toThrow('AUTH_ENABLED');
  });

  it('exige FIREBASE_PROJECT_ID cuando la auth está activa', () => {
    expect(() => validateEnvironment({})).toThrow('FIREBASE_PROJECT_ID');
    expect(() => validateEnvironment({ AUTH_ENABLED: 'false' })).not.toThrow();
  });

  it('valida puerto, booleanos y tipo de base de datos', () => {
    expect(() => validateEnvironment({ ...base, PORT: '99999' })).toThrow(
      'PORT',
    );
    expect(() => validateEnvironment({ ...base, DB_LOGGING: 'si' })).toThrow(
      'DB_LOGGING',
    );
    expect(() => validateEnvironment({ ...base, DB_TYPE: 'mysql' })).toThrow(
      'DB_TYPE',
    );
  });

  it('exige credenciales completas para postgres', () => {
    expect(() => validateEnvironment({ ...base, DB_TYPE: 'postgres' })).toThrow(
      'DB_HOST',
    );
    expect(() =>
      validateEnvironment({
        ...base,
        DB_TYPE: 'postgres',
        DB_HOST: 'localhost',
        DB_USERNAME: 'u',
        DB_PASSWORD: 'p',
        DB_DATABASE: 'd',
      }),
    ).not.toThrow();
  });
});

describe('parseList', () => {
  it('separa por comas, limpia espacios y pasa a minúsculas', () => {
    expect(parseList(' A@x.co , b@x.co,, ')).toEqual(['a@x.co', 'b@x.co']);
    expect(parseList(undefined)).toEqual([]);
  });
});
