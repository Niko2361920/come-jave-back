import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminOnly, CurrentUser } from '../../auth/auth.decorators';
import type { AuthenticatedUser } from '../../auth/auth.types';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../services/users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Cada persona registra su propio perfil (el correo debe coincidir con el token).
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.usersService.create(createUserDto, authUser);
  }

  @AdminOnly()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Debe ir antes de :id para que "me" no se interprete como un id.
  @Get('me')
  findMe(@CurrentUser() authUser: AuthenticatedUser) {
    return this.usersService.findMe(authUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.usersService.findOne(id, authUser);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.usersService.update(id, updateUserDto, authUser);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    return this.usersService.remove(id, authUser);
  }
}
