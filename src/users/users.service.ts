import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(email: string, password: string, name?: string) {
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      passwordHash,
      name: name || email.split('@')[0],
    });
    await this.userRepo.save(user);
    const { passwordHash: hash, ...rest } = user;
    void hash;
    return rest;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: hash, ...rest } = user;
    void hash;
    return rest;
  }

  async updatePlan(id: string, plan: string, expiresAt?: Date) {
    const update: Record<string, unknown> = { plan };
    if (expiresAt !== undefined) update.planExpiresAt = expiresAt;
    await this.userRepo.update(id, update);
    return this.findById(id);
  }
}
