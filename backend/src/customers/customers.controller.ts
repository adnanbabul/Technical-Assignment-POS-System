import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.customersService.search(search);
    }
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.customersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.customersService.update(Number(id), body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.customersService.remove(Number(id));
  }
}
