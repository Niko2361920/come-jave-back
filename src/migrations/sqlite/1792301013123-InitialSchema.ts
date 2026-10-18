import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792301013123 implements MigrationInterface {
  name = 'InitialSchema1792301013123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "document" varchar(20), "name" varchar(100) NOT NULL, "email" varchar(254) NOT NULL, "age" integer, "phone" varchar(30), "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_c1b20b2a1883ed106c3e746c25a" UNIQUE ("document"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "total" decimal(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30e6836e8539f85bfc47198067" ON "orders" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" varchar PRIMARY KEY NOT NULL, "sku" varchar(60), "name" varchar(120) NOT NULL, "description" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT (1), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" varchar PRIMARY KEY NOT NULL, "orderId" varchar NOT NULL, "productId" varchar NOT NULL, "quantity" integer NOT NULL, "unitPrice" decimal(10,2) NOT NULL)`,
    );
    await queryRunner.query(`DROP INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4"`);
    await queryRunner.query(`DROP INDEX "IDX_30e6836e8539f85bfc47198067"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_orders" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "total" decimal(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_orders"("id", "userId", "total", "status", "createdAt") SELECT "id", "userId", "total", "status", "createdAt" FROM "orders"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_orders" RENAME TO "orders"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30e6836e8539f85bfc47198067" ON "orders" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_order_items" ("id" varchar PRIMARY KEY NOT NULL, "orderId" varchar NOT NULL, "productId" varchar NOT NULL, "quantity" integer NOT NULL, "unitPrice" decimal(10,2) NOT NULL, CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_order_items"("id", "orderId", "productId", "quantity", "unitPrice") SELECT "id", "orderId", "productId", "quantity", "unitPrice" FROM "order_items"`,
    );
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_order_items" RENAME TO "order_items"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" RENAME TO "temporary_order_items"`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" varchar PRIMARY KEY NOT NULL, "orderId" varchar NOT NULL, "productId" varchar NOT NULL, "quantity" integer NOT NULL, "unitPrice" decimal(10,2) NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "order_items"("id", "orderId", "productId", "quantity", "unitPrice") SELECT "id", "orderId", "productId", "quantity", "unitPrice" FROM "temporary_order_items"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_order_items"`);
    await queryRunner.query(`DROP INDEX "IDX_30e6836e8539f85bfc47198067"`);
    await queryRunner.query(`DROP INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4"`);
    await queryRunner.query(
      `ALTER TABLE "orders" RENAME TO "temporary_orders"`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "total" decimal(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('PENDING'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "orders"("id", "userId", "total", "status", "createdAt") SELECT "id", "userId", "total", "status", "createdAt" FROM "temporary_orders"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_orders"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_30e6836e8539f85bfc47198067" ON "orders" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `,
    );
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP INDEX "IDX_30e6836e8539f85bfc47198067"`);
    await queryRunner.query(`DROP INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
