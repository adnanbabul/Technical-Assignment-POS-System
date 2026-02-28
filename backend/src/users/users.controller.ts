import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from './role.enum';

class CreateCashierDto {
  name: string;
  email: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get()
  list() {
    return this.usersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Post()
  createCashier(@Body() body: CreateCashierDto) {
    return this.usersService.createCashier(body);
  }
}

