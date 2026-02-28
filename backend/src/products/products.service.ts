import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onModuleInit() {
    console.log('🔧 ProductsService onModuleInit starting...');
    // Wait a bit to ensure categories are seeded first
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.seedProducts();
    console.log('🔧 ProductsService onModuleInit completed');
  }

  private async seedProducts() {
    const count = await this.productsRepo.count();
    console.log(`Current product count: ${count}`);
    if (count === 0) {
      console.log('Seeding products...');
      // Wait for categories to be available
      let attempts = 0;
      let categoriesExist = false;
      while (!categoriesExist && attempts < 10) {
        const categoryCount = await this.categoryRepo.count();
        console.log(`Category count: ${categoryCount}, attempts: ${attempts}`);
        if (categoryCount > 0) {
          categoriesExist = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }

      if (!categoriesExist) {
        console.error('Categories not found, skipping product seeding');
        return;
      }

      console.log('Categories found, finding category objects...');
      // Find categories by name
      const chicken = await this.categoryRepo.findOne({ where: { name: 'Chicken' } });
      const seafood = await this.categoryRepo.findOne({ where: { name: 'Seafood' } });
      const pasta = await this.categoryRepo.findOne({ where: { name: 'Pasta' } });
      const riceBowl = await this.categoryRepo.findOne({ where: { name: 'Rice bowl' } });
      console.log(`Found categories - Chicken: ${chicken?.id}, Seafood: ${seafood?.id}, Pasta: ${pasta?.id}, Rice bowl: ${riceBowl?.id}`);

      const seedData = [
        // Chicken (1-6)
        { name: 'Grilled Chicken Breast', categoryId: chicken?.id, price: 12.99, active: true, image: '/uploads/products/1.png' },
        { name: 'Crispy Fried Chicken', categoryId: chicken?.id, price: 10.99, active: true, image: '/uploads/products/2.png' },
        { name: 'BBQ Chicken Wings', categoryId: chicken?.id, price: 9.99, active: true, image: '/uploads/products/3.png' },
        { name: 'Chicken Tikka', categoryId: chicken?.id, price: 11.99, active: true, image: '/uploads/products/4.png' },
        { name: 'Honey Garlic Chicken', categoryId: chicken?.id, price: 12.49, active: true, image: '/uploads/products/5.png' },
        { name: 'Buffalo Chicken Tenders', categoryId: chicken?.id, price: 10.49, active: true, image: '/uploads/products/6.png' },
        
        // Seafood (7-12)
        { name: 'Grilled Salmon', categoryId: seafood?.id, price: 16.99, active: true, image: '/uploads/products/7.png' },
        { name: 'Shrimp Scampi', categoryId: seafood?.id, price: 15.99, active: true, image: '/uploads/products/8.png' },
        { name: 'Fish & Chips', categoryId: seafood?.id, price: 13.99, active: true, image: '/uploads/products/9.png' },
        { name: 'Crab Cakes', categoryId: seafood?.id, price: 14.99, active: true, image: '/uploads/products/10.png' },
        { name: 'Lobster Tail', categoryId: seafood?.id, price: 24.99, active: true, image: '/uploads/products/11.png' },
        { name: 'Seafood Platter', categoryId: seafood?.id, price: 22.99, active: true, image: '/uploads/products/12.png' },
        
        // Pasta (13-17)
        { name: 'Spaghetti Carbonara', categoryId: pasta?.id, price: 11.99, active: true, image: '/uploads/products/13.png' },
        { name: 'Penne Arrabbiata', categoryId: pasta?.id, price: 10.99, active: true, image: '/uploads/products/14.png' },
        { name: 'Lasagna', categoryId: pasta?.id, price: 12.99, active: true, image: '/uploads/products/15.png' },
        { name: 'Fettuccine Alfredo', categoryId: pasta?.id, price: 11.99, active: true, image: '/uploads/products/16.png' },
        { name: 'Pesto Linguine', categoryId: pasta?.id, price: 11.49, active: true, image: '/uploads/products/17.png' },
        
        // Rice bowl (18-22)
        { name: 'Chicken Teriyaki Bowl', categoryId: riceBowl?.id, price: 10.99, active: true, image: '/uploads/products/18.png' },
        { name: 'Beef Bulgogi Bowl', categoryId: riceBowl?.id, price: 12.99, active: true, image: '/uploads/products/19.png' },
        { name: 'Vegetable Fried Rice', categoryId: riceBowl?.id, price: 8.99, active: true, image: '/uploads/products/20.png' },
        { name: 'Shrimp Fried Rice', categoryId: riceBowl?.id, price: 11.99, active: true, image: '/uploads/products/21.png' },
        { name: 'Kimchi Fried Rice', categoryId: riceBowl?.id, price: 9.99, active: true, image: '/uploads/products/22.png' },
      ];

      for (const data of seedData) {
        // Check if product already exists by name
        const existing = await this.productsRepo.findOne({ where: { name: data.name } });
        if (!existing) {
          const product = this.productsRepo.create(data);
          await this.productsRepo.save(product);
        }
      }
      console.log(`✓ Seeded ${seedData.length} products successfully`);
    } else {
      console.log('Products already seeded, skipping');
    }
  }

  async paginated(page = 1, limit = 100) {
    const [items, total] = await this.productsRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
      relations: ['category'],
    });
    return { items, total, page, limit };
  }

  create(data: Partial<Product>) {
    const product = this.productsRepo.create(data);
    return this.productsRepo.save(product);
  }

  async update(id: number, data: Partial<Product>) {
    await this.productsRepo.update(id, data);
    return this.productsRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.productsRepo.delete(id);
    return { id };
  }

  findAllActive() {
    console.log('Finding all active products...');
    return this.productsRepo.find({ where: { active: true }, order: { name: 'ASC' } })
      .then(products => {
        console.log(`Found ${products.length} active products`);
        return products;
      });
  }

  async deleteProductsWithoutImages() {
    const productsWithoutImages = await this.productsRepo.find({
      where: { image: IsNull() },
    });
    const ids = productsWithoutImages.map(p => p.id);
    if (ids.length > 0) {
      await this.productsRepo.delete(ids);
    }
    return { deleted: ids.length, ids };
  }
}

