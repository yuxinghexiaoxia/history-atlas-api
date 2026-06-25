import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dynasty, Person, Event } from '../database/entities';

@Injectable()
export class DynastiesService {
  constructor(
    @InjectRepository(Dynasty) private dynastyRepo: Repository<Dynasty>,
    @InjectRepository(Person) private personRepo: Repository<Person>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  findAll() {
    return this.dynastyRepo.find();
  }

  async findOne(id: string) {
    const dynasty = await this.dynastyRepo.findOne({ where: { id } });
    if (!dynasty) throw new NotFoundException('Dynasty not found');
    const persons = await this.personRepo.find({
      where: { dynastyId: id, published: true },
    });
    const events = await this.eventRepo.find({
      where: { dynastyId: id, published: true },
    });
    return { dynasty, persons, events };
  }
}
