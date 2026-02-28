import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('active')
  @Public()
  findAllActive() {
    return this.categoriesService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: Partial<Category> = {
      name: body.name,
      active: body.active === true || body.active === 'true',
    };

    if (file) {
      data.image = `/uploads/categories/${file.filename}`;
    }

    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: Partial<Category> = {
      name: body.name,
      active: body.active === true || body.active === 'true',
    };

    if (file) {
      data.image = `/uploads/categories/${file.filename}`;
    }

    return this.categoriesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
