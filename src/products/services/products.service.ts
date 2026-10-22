import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../../common/db-errors';
import { CreateProductDto } from '../dto/create-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.saveOrConflict(product);
  }

  // Filtros simples con QueryBuilder.
  // Ej: GET /products?name=pizza&minPrice=50&maxPrice=200
  async findAll(filter?: FilterProductDto): Promise<Product[]> {
    const qb = this.productsRepository.createQueryBuilder('product');
    qb.where('product.isActive = :isActive', { isActive: true });

    if (filter?.name) {
      // ILIKE no existe en sqlite, usamos LIKE con LOWER para case-insensitive.
      // Se escapan % y _ para que se busquen como texto literal.
      const escaped = filter.name.replace(/[\\%_]/g, (char) => `\\${char}`);
      qb.andWhere("LOWER(product.name) LIKE LOWER(:name) ESCAPE '\\'", {
        name: `%${escaped}%`,
      });
    }
    if (filter?.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter?.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }
    if (filter?.minStock !== undefined) {
      qb.andWhere('product.stock >= :minStock', { minStock: filter.minStock });
    }
    if (filter?.maxStock !== undefined) {
      qb.andWhere('product.stock <= :maxStock', { maxStock: filter.maxStock });
    }

    qb.orderBy('product.createdAt', 'DESC').addOrderBy('product.name', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({
      id,
      isActive: true,
    });
    if (!product) {
      throw new NotFoundException(`El producto con el id: ${id} no existe`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.saveOrConflict(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productsRepository.save(product);
  }

  private async saveOrConflict(product: Product): Promise<Product> {
    try {
      return await this.productsRepository.save(product);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Ya existe un producto con ese sku');
      }
      throw error;
    }
  }
}
