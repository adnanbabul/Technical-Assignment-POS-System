import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
  ) {}

  async findAll() {
    return this.customersRepo.find({
      relations: ['sales'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      loadRelationIds: false,
    }).then(customers => 
      customers.map(customer => ({
        ...customer,
        _count: {
          sales: customer.sales?.length || 0,
        },
        sales: undefined, // Don't send full sales data
      }))
    );
  }

  async findOne(id: number) {
    return this.customersRepo.findOne({ where: { id } });
  }

  async create(data: Partial<Customer>) {
    const customer = this.customersRepo.create(data);
    return this.customersRepo.save(customer);
  }

  async update(id: number, data: Partial<Customer>) {
    await this.customersRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.customersRepo.delete(id);
    return { success: true };
  }

  async search(query: string) {
    return this.customersRepo
      .createQueryBuilder('customer')
      .where('customer.name LIKE :query', { query: `%${query}%` })
      .orWhere('customer.phone LIKE :query', { query: `%${query}%` })
      .orWhere('customer.email LIKE :query', { query: `%${query}%` })
      .orWhere('customer.address LIKE :query', { query: `%${query}%` })
      .orderBy('customer.createdAt', 'DESC')
      .getMany();
  }
}
