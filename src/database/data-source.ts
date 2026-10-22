import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';

// Usado por la CLI de TypeORM (migration:generate / run / revert).
// La app en sí se configura en AppModule; ambas leen las mismas variables .env.
try {
  process.loadEnvFile('.env');
} catch {
  // sin .env: se usan las variables del entorno / valores por defecto
}

const databaseType = process.env.DB_TYPE ?? 'sqlite';
const isPostgres = databaseType === 'postgres';

const options: DataSourceOptions = isPostgres
  ? {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      migrations: [
        join(__dirname, '..', 'migrations', 'postgres', '*.{js,ts}'),
      ],
    }
  : {
      type: 'better-sqlite3',
      database: process.env.DB_DATABASE ?? 'data/app.sqlite',
      migrations: [join(__dirname, '..', 'migrations', 'sqlite', '*.{js,ts}')],
    };

export default new DataSource({
  ...options,
  entities: [join(__dirname, '..', '**', '*.entity.{js,ts}')],
  synchronize: false,
});
