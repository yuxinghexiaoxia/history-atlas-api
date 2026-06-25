import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event, Person, PersonEvent } from '../database/entities';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Person) private personRepo: Repository<Person>,
    @InjectRepository(PersonEvent) private peRepo: Repository<PersonEvent>,
  ) {}

  findAll() {
    return this.eventRepo.find({ where: { published: true } });
  }

  async findOne(id: string) {
    const event = await this.eventRepo.findOne({
      where: { id, published: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async getPersons(id: string) {
    const links = await this.peRepo.find({ where: { eventId: id } });
    if (links.length === 0) return [];
    return this.personRepo.findBy({ id: In(links.map((l) => l.personId)) });
  }
}
