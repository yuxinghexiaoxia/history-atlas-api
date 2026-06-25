import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person, Event, Dynasty, Relation, User } from '../database/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Person) private personRepo: Repository<Person>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Dynasty) private dynastyRepo: Repository<Dynasty>,
    @InjectRepository(Relation) private relationRepo: Repository<Relation>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async stats() {
    const [persons, events, dynasties, relations, users] = await Promise.all([
      this.personRepo.count(),
      this.eventRepo.count(),
      this.dynastyRepo.count(),
      this.relationRepo.count(),
      this.userRepo.count(),
    ]);
    return { persons, events, dynasties, relations, users };
  }

  async setPersonPublished(id: string, published: boolean) {
    const res = await this.personRepo.update(id, { published });
    if (res.affected === 0) throw new NotFoundException('Person not found');
    return this.personRepo.findOne({ where: { id } });
  }

  async setEventPublished(id: string, published: boolean) {
    const res = await this.eventRepo.update(id, { published });
    if (res.affected === 0) throw new NotFoundException('Event not found');
    return this.eventRepo.findOne({ where: { id } });
  }

  async listUsers() {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.plan,
      createdAt: u.createdAt,
    }));
  }
}
