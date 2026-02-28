import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  list(@Query('page') page = '1', @Query('limit') limit = '100') {
    return this.productsService.paginated(Number(page), Number(limit));
  }

  @Get('active')
  @Public()
  active() {
    return this.productsService.findAllActive();
  }

  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const productData = {
      ...body,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      price: parseFloat(body.price),
      active: body.active === 'true' || body.active === true,
      image: file ? `/uploads/products/${file.filename}` : null,
    };
    return this.productsService.create(productData);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const productData: any = {};
    
    if (body.name) productData.name = body.name;
    if (body.categoryId !== undefined) productData.categoryId = body.categoryId ? Number(body.categoryId) : null;
    if (body.price) productData.price = parseFloat(body.price);
    if (body.active !== undefined) productData.active = body.active === 'true' || body.active === true;
    if (file) productData.image = `/uploads/products/${file.filename}`;
    
    return this.productsService.update(Number(id), productData);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.remove(Number(id));
  }

  @Roles(Role.ADMIN)
  @Post('cleanup/no-images')
  deleteProductsWithoutImages() {
    return this.productsService.deleteProductsWithoutImages();
  }
}

