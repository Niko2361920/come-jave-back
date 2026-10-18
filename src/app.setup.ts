import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { parseList } from './config/env.validation';

/**
 * Configuración compartida entre main.ts y los tests e2e, para que las
 * pruebas ejerciten exactamente los mismos pipes, CORS y cabeceras.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const swaggerEnabled = config.get<string>('SWAGGER_ENABLED') === 'true';

  // Swagger UI necesita scripts inline; solo se relaja la CSP cuando está activo.
  app.use(
    helmet({ contentSecurityPolicy: swaggerEnabled ? false : undefined }),
  );

  const origins = parseList(
    config.get<string>(
      'CORS_ORIGINS',
      'http://localhost:8080,http://localhost:5173',
    ),
  );
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos que no están en el DTO
      forbidNonWhitelisted: true, // y responde 400 si llegan
      transform: true, // convierte query/params según el DTO
    }),
  );

  app.enableShutdownHooks();

  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Come Jave API')
        .setDescription('Usuarios, productos y pedidos de Come Jave')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }
}
