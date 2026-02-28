import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Customer } from '../customers/customer.entity';

type CreateSaleItemInput = {
  productId: number;
  quantity: number;
};

type CreateSaleInput = {
  items: CreateSaleItemInput[];
  taxRate?: number; // e.g. 0.1 for 10%
  customerId?: number;
  invoiceNumber: string;
  orderNumber: string;
};

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepo: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepo: Repository<SaleItem>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
  ) {}

  async create(cashierId: number, input: CreateSaleInput) {
    try {
      console.log('Creating sale for cashier:', cashierId, 'with items:', input.items);
      
      const productIds = input.items.map((i) => i.productId);
      const products = await this.productsRepo.find({
        where: { id: In(productIds) },
      });

      console.log('Found products:', products.length);

      const items: SaleItem[] = [];
      let subtotal = 0;

      for (const itemInput of input.items) {
        const product = products.find((p) => p.id === itemInput.productId);
        if (!product) {
          console.error('Product not found:', itemInput.productId);
          continue;
        }
        const lineTotal = Number(product.price) * itemInput.quantity;
        subtotal += lineTotal;

        const item = this.saleItemsRepo.create({
          product,
          quantity: itemInput.quantity,
          unitPrice: Number(product.price),
          lineTotal,
        });
        items.push(item);
      }

      if (items.length === 0) {
        throw new Error('No valid items in sale');
      }

      const taxRate = input.taxRate ?? 0.0;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const cashier = await this.usersRepo.findOne({ where: { id: cashierId } });
      if (!cashier) {
        console.error('Cashier not found:', cashierId);
        throw new Error('Cashier not found');
      }

      // Fetch customer if customerId is provided
      let customer: any = undefined;
      if (input.customerId) {
        customer = await this.customersRepo.findOne({ where: { id: input.customerId } });
        if (!customer) {
          console.error('Customer not found:', input.customerId);
          throw new Error('Customer not found');
        }
        console.log('Customer selected:', customer.name);
      }

      console.log('Creating sale with subtotal:', subtotal, 'tax:', tax, 'total:', total);

      const saleData: Partial<Sale> = {
        cashier,
        items,
        subtotal,
        tax,
        total,
        invoiceNumber: input.invoiceNumber,
        orderNumber: input.orderNumber,
      };

      if (customer) {
        saleData.customer = customer;
      }

      const sale = this.salesRepo.create(saleData);
      
      const savedSale = await this.salesRepo.save(sale) as unknown as Sale;
      console.log('Sale saved successfully:', savedSale.id);
      
      return savedSale;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  history(from?: string, to?: string) {
    const where: any = {};
    if (from && to) {
      where.createdAt = Between(new Date(from), new Date(to));
    } else if (from) {
      where.createdAt = MoreThanOrEqual(new Date(from));
    }
    return this.salesRepo.find({
      where,
      relations: ['items', 'items.product', 'items.product.category', 'cashier', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async todaySummary() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await this.salesRepo.find({
      where: { createdAt: Between(start, end) },
    });

    const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const orderCount = sales.length;
    const avgTicket = orderCount ? totalSales / orderCount : 0;

    return {
      totalSales,
      orderCount,
      avgTicket,
    };
  }
}

