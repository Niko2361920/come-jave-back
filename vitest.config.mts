import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Nest 12 es ESM puro; Vitest delega las dependencias a Node, así que funciona
// con ESM y CJS mezclados. SWC se encarga de los decoradores y su metadata.
const swcPlugin = swc.vite({
  jsc: {
    target: 'es2023',
    parser: { syntax: 'typescript', decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
  },
});

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    projects: [
      {
        plugins: [swcPlugin],
        test: {
          name: 'unit',
          globals: true,
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        plugins: [swcPlugin],
        test: {
          name: 'e2e',
          globals: true,
          include: ['test/**/*.e2e-spec.ts'],
          setupFiles: ['test/setup-env.ts'],
          // El e2e comparte una base en memoria por archivo; se corre en serie.
          fileParallelism: false,
        },
      },
    ],
  },
});
