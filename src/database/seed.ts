import dataSource from './data-source';
import { menuSeed } from './menu.seed';
import { Product } from '../products/entities/product.entity';

/**
 * Carga el menú fijo de Ventolini y La Frute. Es idempotente: si el sku ya
 * existe actualiza nombre/descripción/precio y NO toca el stock.
 *
 *   npm run seed            (desarrollo)
 *   npm run seed:prod       (sobre el build en dist/)
 */
async function seed() {
  const initialStock = Number(process.env.SEED_STOCK ?? 200);
  if (!Number.isInteger(initialStock) || initialStock < 0) {
    throw new Error('SEED_STOCK debe ser un entero >= 0');
  }

  await dataSource.initialize();
  await dataSource.runMigrations(); // asegura que el esquema exista
  const products = dataSource.getRepository(Product);

  let created = 0;
  let updated = 0;
  for (const item of menuSeed) {
    const existing = await products.findOneBy({ sku: item.sku });
    if (existing) {
      Object.assign(existing, {
        name: item.name,
        description: item.description,
        price: item.price,
        isActive: true,
      });
      await products.save(existing);
      updated++;
    } else {
      await products.save(products.create({ ...item, stock: initialStock }));
      created++;
    }
  }

  console.log(`Menú cargado: ${created} creados, ${updated} actualizados.`);
  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
