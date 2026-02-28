import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const count = await this.categoriesRepo.count();
    if (count === 0) {
      const seedData = [
        { name: 'Chicken', image: '/uploads/categories/1.png', active: true },
        { name: 'Seafood', image: '/uploads/categories/2.png', active: true },
        { name: 'Pasta', image: '/uploads/categories/3.png', active: true },
        { name: 'Rice bowl', image: '/uploads/categories/4.png', active: true },
        { name: 'Beverages', image: '/uploads/categories/5.png', active: true },
      ];

      for (const data of seedData) {
        const category = this.categoriesRepo.create(data);
        await this.categoriesRepo.save(category);
      }
    }
  }

  findAll() {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  findAllActive() {
    return this.categoriesRepo.find({ 
      where: { active: true }, 
      order: { name: 'ASC' } 
    });
  }

  findOne(id: number) {
    return this.categoriesRepo.findOne({ where: { id } });
  }

  create(data: Partial<Category>) {
    const category = this.categoriesRepo.create(data);
    return this.categoriesRepo.save(category);
  }

  async update(id: number, data: Partial<Category>) {
    await this.categoriesRepo.update(id, data);
    return this.categoriesRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.categoriesRepo.delete(id);
    return { id };
  }
}
