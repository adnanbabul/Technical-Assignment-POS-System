import { Body, Controller, Get, Post, Query, Req, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSaleDtoItem {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}

class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDtoItem)
  items: CreateSaleDtoItem[];

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsString()
  invoiceNumber: string;

  @IsString()
  orderNumber: string;
}

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(Role.ADMIN, Role.CASHIER)
  @Post()
  async create(@Req() req: any, @Body() body: CreateSaleDto) {
    try {
      console.log('Sale creation request from user:', req.user);
      console.log('Sale data:', body);
      
      if (!body.items || body.items.length === 0) {
        throw new HttpException('No items provided', HttpStatus.BAD_REQUEST);
      }
      
      const result = await this.salesService.create(req.user.userId, body);
      return result;
    } catch (error) {
      console.error('Sale creation error in controller:', error);
      throw new HttpException(
        error.message || 'Failed to create sale',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(Role.ADMIN, Role.CASHIER)
  @Get('history')
  history(@Query('from') from?: string, @Query('to') to?: string) {
    return this.salesService.history(from, to);
  }

  @Roles(Role.ADMIN, Role.CASHIER)
  @Get('dashboard/today')
  todaySummary() {
    return this.salesService.todaySummary();
  }
}

