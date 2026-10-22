import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { AppController } from './app.controller';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { validateEnvironment } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    // 100 peticiones por minuto por IP; ajustable cuando se conozca el tráfico real.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseType = configService.get<string>('DB_TYPE', 'sqlite');
        const synchronize =
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';
        const logging =
          configService.get<string>('DB_LOGGING', 'false') === 'true';

        const common = {
          autoLoadEntities: true,
          synchronize,
          logging,
          // Con synchronize apagado el esquema lo crean las migraciones; con
          // synchronize encendido (dev/tests) ni siquiera se cargan.
          migrations: synchronize
            ? []
            : [
                join(
                  __dirname,
                  'migrations',
                  databaseType === 'postgres' ? 'postgres' : 'sqlite',
                  '*.{js,ts}',
                ),
              ],
          migrationsRun: !synchronize,
        };

        if (databaseType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.getOrThrow<string>('DB_HOST'),
            port: Number(configService.get<string>('DB_PORT', '5432')),
            username: configService.getOrThrow<string>('DB_USERNAME'),
            password: configService.getOrThrow<string>('DB_PASSWORD'),
            database: configService.getOrThrow<string>('DB_DATABASE'),
            ...common,
          } as unknown as TypeOrmModuleOptions;
        }

        if (databaseType === 'sqlite' || databaseType === 'better-sqlite3') {
          const database = configService.get<string>(
            'DB_DATABASE',
            'data/app.sqlite',
          );
          // El archivo de la BD ya no vive en git, así que se crea su carpeta.
          if (database !== ':memory:') {
            mkdirSync(dirname(database), { recursive: true });
          }
          return {
            type: 'better-sqlite3',
            database,
            ...common,
          } as unknown as TypeOrmModuleOptions;
        }

        throw new Error(`DB_TYPE no soportado: ${databaseType}`);
      },
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    // El orden importa: primero el límite de peticiones, luego la autenticación.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
  ],
})
export class AppModule {}
