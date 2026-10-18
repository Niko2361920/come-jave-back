import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

// El entorno (auth simulada, BD) se fija en test/setup-env.ts.
// Por defecto usa SQLite en memoria; con E2E_DB=postgres usa un Postgres local:
//   E2E_DB=postgres DB_HOST=localhost DB_USERNAME=... DB_PASSWORD=... \
//   DB_DATABASE=come_jave_test npm run test:e2e
const usePostgres = process.env.E2E_DB === 'postgres';

const admin = { 'x-dev-email': 'admin@javerianacali.edu.co' };
const maria = {
  'x-dev-email': 'maria@javerianacali.edu.co',
  'x-dev-admin': 'false',
};
const pedro = {
  'x-dev-email': 'pedro@javerianacali.edu.co',
  'x-dev-admin': 'false',
};

describe('Come Jave API (e2e)', () => {
  let app: INestApplication<App>;
  let http: ReturnType<typeof request>;
  let dataSource: DataSource;
  let pizzaId: string;
  let bowlId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    dataSource = app.get(DataSource);
    if (usePostgres) {
      // Esquema limpio en cada corrida (el DROP también se lleva la extensión).
      await dataSource.query(
        'DROP SCHEMA public CASCADE; CREATE SCHEMA public; CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      );
      await dataSource.synchronize();
    }
    // Escuchando en un puerto libre para poder lanzar peticiones simultáneas.
    await app.listen(0);
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('público', () => {
    it('GET / responde el estado de la API', async () => {
      const res = await http.get('/').expect(200);
      expect(res.body.status).toBe('online');
    });

    it('GET /health verifica la base de datos', async () => {
      const res = await http.get('/health').expect(200);
      expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
    });

    it('envía cabeceras de seguridad (helmet)', async () => {
      const res = await http.get('/').expect(200);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('validación', () => {
    it('rechaza campos que no están en el DTO', async () => {
      await http
        .post('/users')
        .set(maria)
        .send({
          email: maria['x-dev-email'],
          name: 'María',
          isActive: false,
        })
        .expect(400);
    });

    it('rechaza correos y datos inválidos', async () => {
      await http
        .post('/users')
        .set(maria)
        .send({ email: 'no-es-correo', name: 'M' })
        .expect(400);
    });

    it('rechaza ids que no son UUID', async () => {
      await http.get('/users/123').set(admin).expect(400);
      await http.get('/orders/123').set(admin).expect(400);
    });
  });

  describe('usuarios', () => {
    it('cada persona solo registra su propio correo', async () => {
      await http
        .post('/users')
        .set(maria)
        .send({ email: 'otra@javerianacali.edu.co', name: 'Otra' })
        .expect(403);

      const res = await http
        .post('/users')
        .set(maria)
        .send({ email: 'MARIA@javerianacali.edu.co', name: 'María Pérez' })
        .expect(201);
      expect(res.body.email).toBe('maria@javerianacali.edu.co');
      expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);

      await http
        .post('/users')
        .set(maria)
        .send({ email: 'maria@javerianacali.edu.co', name: 'María' })
        .expect(409);

      await http
        .post('/users')
        .set(pedro)
        .send({ email: 'pedro@javerianacali.edu.co', name: 'Pedro Gómez' })
        .expect(201);
    });

    it('GET /users es solo para admin y /users/me para cada quien', async () => {
      await http.get('/users').set(maria).expect(403);
      const list = await http.get('/users').set(admin).expect(200);
      expect(list.body).toHaveLength(2);

      const me = await http.get('/users/me').set(maria).expect(200);
      expect(me.body.name).toBe('María Pérez');
    });

    it('nadie lee ni edita el perfil de otra persona', async () => {
      const me = await http.get('/users/me').set(maria).expect(200);
      await http.get(`/users/${me.body.id}`).set(pedro).expect(403);
      await http
        .put(`/users/${me.body.id}`)
        .set(pedro)
        .send({ name: 'Hackeado' })
        .expect(403);
      await http
        .put(`/users/${me.body.id}`)
        .set(maria)
        .send({ name: 'María P.' })
        .expect(200);
    });
  });

  describe('productos', () => {
    it('solo un admin crea productos', async () => {
      await http
        .post('/products')
        .set(maria)
        .send({ name: 'Pizza', price: 26000, stock: 3 })
        .expect(403);

      const pizza = await http
        .post('/products')
        .set(admin)
        .send({ sku: 'ventolini:z1', name: 'Pizza', price: 26000, stock: 3 })
        .expect(201);
      const bowl = await http
        .post('/products')
        .set(admin)
        .send({
          sku: 'lafrute:b1',
          name: 'Bowl Açaí',
          price: 18000.5,
          stock: 50,
        })
        .expect(201);
      pizzaId = pizza.body.id;
      bowlId = bowl.body.id;

      await http
        .post('/products')
        .set(admin)
        .send({ sku: 'ventolini:z1', name: 'Repetida', price: 1, stock: 1 })
        .expect(409);
    });

    it('el menú se lista y se filtra sin ser admin', async () => {
      const all = await http.get('/products').set(maria).expect(200);
      expect(all.body).toHaveLength(2);
      expect(typeof all.body[0].price).toBe('number');

      const filtered = await http
        .get('/products?name=piz&maxPrice=30000')
        .set(maria)
        .expect(200);
      expect(filtered.body.map((p: { name: string }) => p.name)).toEqual([
        'Pizza',
      ]);

      await http.get('/products?minPrice=abc').set(maria).expect(400);
    });
  });

  describe('pedidos', () => {
    const stockOf = async (id: string) =>
      (await http.get(`/products/${id}`).set(maria).expect(200)).body.stock;

    it('descuenta stock y suma los productos repetidos', async () => {
      const res = await http
        .post('/orders')
        .set(maria)
        .send({
          items: [
            { productId: pizzaId, quantity: 1 },
            { productId: pizzaId, quantity: 1 },
            { productId: bowlId, quantity: 2 },
          ],
        })
        .expect(201);

      expect(res.body.status).toBe('PENDING');
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(2 * 26000 + 2 * 18000.5);
      expect(await stockOf(pizzaId)).toBe(1);
      expect(await stockOf(bowlId)).toBe(48);
    });

    it('rechaza stock insuficiente sin modificar el inventario', async () => {
      await http
        .post('/orders')
        .set(maria)
        .send({
          items: [
            { productId: bowlId, quantity: 1 },
            { productId: pizzaId, quantity: 5 },
          ],
        })
        .expect(400);
      expect(await stockOf(pizzaId)).toBe(1);
      expect(await stockOf(bowlId)).toBe(48); // el bowl tampoco se descontó
    });

    it('no vende más de lo que hay con pedidos simultáneos', async () => {
      // stock de pizza = 1: de 5 pedidos a la vez solo 1 puede salir bien.
      const results = await Promise.all(
        [maria, pedro, maria, pedro, maria].map((who) =>
          http
            .post('/orders')
            .set(who)
            .send({ items: [{ productId: pizzaId, quantity: 1 }] }),
        ),
      );
      const ok = results.filter((r) => r.status === 201);
      expect(ok).toHaveLength(1);
      expect(results.filter((r) => r.status === 400)).toHaveLength(4);
      expect(await stockOf(pizzaId)).toBe(0);
    });

    it('un usuario no registrado recibe un mensaje claro', async () => {
      const res = await http
        .post('/orders')
        .set({
          'x-dev-email': 'nuevo@javerianacali.edu.co',
          'x-dev-admin': 'false',
        })
        .send({ items: [{ productId: bowlId, quantity: 1 }] })
        .expect(404);
      expect(res.body.message).toContain('POST /users');
    });

    it('cada quien ve solo sus pedidos', async () => {
      const mine = await http.get('/orders/me').set(maria).expect(200);
      expect(mine.body.length).toBeGreaterThanOrEqual(1);
      const orderId = mine.body[0].id;

      await http.get(`/orders/${orderId}`).set(maria).expect(200);
      await http.get(`/orders/${orderId}`).set(pedro).expect(403);
      await http.get('/orders').set(maria).expect(403);
      const all = await http.get('/orders').set(admin).expect(200);
      expect(all.body.length).toBeGreaterThanOrEqual(mine.body.length);
    });

    it('cancelar devuelve el stock una sola vez', async () => {
      const created = await http
        .post('/orders')
        .set(maria)
        .send({ items: [{ productId: bowlId, quantity: 3 }] })
        .expect(201);
      expect(await stockOf(bowlId)).toBe(45);

      await http
        .put(`/orders/${created.body.id}/cancel`)
        .set(pedro)
        .expect(403);
      const cancelled = await http
        .put(`/orders/${created.body.id}/cancel`)
        .set(maria)
        .expect(200);
      expect(cancelled.body.status).toBe('CANCELLED');
      expect(await stockOf(bowlId)).toBe(48);

      await http
        .put(`/orders/${created.body.id}/cancel`)
        .set(maria)
        .expect(400);
      expect(await stockOf(bowlId)).toBe(48);
    });

    it('solo un admin marca pedidos como pagados y no se borran los pagados', async () => {
      const created = await http
        .post('/orders')
        .set(pedro)
        .send({ items: [{ productId: bowlId, quantity: 1 }] })
        .expect(201);
      const id = created.body.id;

      await http
        .put(`/orders/${id}`)
        .set(pedro)
        .send({ status: 'PAID' })
        .expect(403);
      const paid = await http
        .put(`/orders/${id}`)
        .set(admin)
        .send({ status: 'PAID' })
        .expect(200);
      expect(paid.body.status).toBe('PAID');

      await http.put(`/orders/${id}/cancel`).set(pedro).expect(400);
      await http.delete(`/orders/${id}`).set(admin).expect(400);
      await http.delete(`/orders/${id}`).set(pedro).expect(403);
    });

    it('borrar un pedido pendiente devuelve el stock', async () => {
      const before = await stockOf(bowlId);
      const created = await http
        .post('/orders')
        .set(pedro)
        .send({ items: [{ productId: bowlId, quantity: 2 }] })
        .expect(201);
      expect(await stockOf(bowlId)).toBe(before - 2);

      await http.delete(`/orders/${created.body.id}`).set(admin).expect(204);
      expect(await stockOf(bowlId)).toBe(before);
      await http.get(`/orders/${created.body.id}`).set(admin).expect(404);
    });
  });
});
