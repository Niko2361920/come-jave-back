import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../../auth/auth.types';
import { isUniqueViolation } from '../../common/db-errors';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    authUser: AuthenticatedUser,
  ): Promise<User> {
    if (!authUser.isAdmin && createUserDto.email !== authUser.email) {
      throw new ForbiddenException('Solo puedes registrar tu propio correo');
    }
    await this.ensureEmailIsAvailable(createUserDto.email);
    if (createUserDto.document) {
      await this.ensureDocumentIsAvailable(createUserDto.document);
    }

    const user = this.usersRepository.create(createUserDto);
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      // Dos registros simultáneos pueden pasar los chequeos de arriba.
      if (isUniqueViolation(error)) {
        throw new ConflictException('El usuario ya está registrado');
      }
      throw error;
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findBy({ isActive: true });
  }

  /** Usuario dueño del token (null si todavía no se registró). */
  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email, isActive: true });
  }

  async findMe(authUser: AuthenticatedUser): Promise<User> {
    const user = await this.findByEmail(authUser.email);
    if (!user) {
      throw new NotFoundException(
        'Todavía no tienes un perfil registrado; crea uno con POST /users',
      );
    }
    return user;
  }

  async findOne(id: string, authUser: AuthenticatedUser): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id, isActive: true });
    if (!user) {
      throw new NotFoundException(`El usuario con el id: ${id} no existe`);
    }
    this.assertCanAccess(user, authUser);
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    authUser: AuthenticatedUser,
  ): Promise<User> {
    const user = await this.findOne(id, authUser);

    if (updateUserDto.document && updateUserDto.document !== user.document) {
      await this.ensureDocumentIsAvailable(updateUserDto.document);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string, authUser: AuthenticatedUser): Promise<void> {
    const user = await this.findOne(id, authUser);
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  private assertCanAccess(user: User, authUser: AuthenticatedUser): void {
    if (!authUser.isAdmin && user.email !== authUser.email) {
      throw new ForbiddenException('No tienes acceso a este usuario');
    }
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    if (await this.usersRepository.existsBy({ email })) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }
  }

  private async ensureDocumentIsAvailable(document: string): Promise<void> {
    if (await this.usersRepository.existsBy({ document })) {
      throw new ConflictException(
        'Ya existe un usuario con este número de identificación',
      );
    }
  }
}
