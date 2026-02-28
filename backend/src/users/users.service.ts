import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from './role.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAdmin();
  }

  private async ensureDefaultAdmin() {
    const count = await this.usersRepo.count();
    if (count === 0) {
      const passwordHash = await bcrypt.hash('admin', 10);
      const admin = this.usersRepo.create({
        email: 'admin@gmail.com',
        name: 'Admin',
        passwordHash,
        role: Role.ADMIN,
      });
      await this.usersRepo.save(admin);
    }
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async createCashier(data: { name: string; email: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const cashier = this.usersRepo.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.CASHIER,
    });
    return this.usersRepo.save(cashier);
  }

  findAll() {
    return this.usersRepo.find();
  }
}

