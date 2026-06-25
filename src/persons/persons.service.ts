import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Person, Relation, Event, PersonEvent } from '../database/entities';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person) private personRepo: Repository<Person>,
    @InjectRepository(Relation) private relationRepo: Repository<Relation>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(PersonEvent) private peRepo: Repository<PersonEvent>,
  ) {}

  findAll() {
    return this.personRepo.find({ where: { published: true } });
  }

  async findOne(id: string) {
    const person = await this.personRepo.findOne({
      where: { id, published: true },
    });
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }

  async getRelations(id: string) {
    const [outgoing, incoming] = await Promise.all([
      this.relationRepo.find({ where: { sourceId: id } }),
      this.relationRepo.find({ where: { targetId: id } }),
    ]);
    return { outgoing, incoming };
  }

  async getEvents(id: string) {
    const links = await this.peRepo.find({ where: { personId: id } });
    if (links.length === 0) return [];
    return this.eventRepo.findBy({ id: In(links.map((l) => l.eventId)) });
  }

  async getSimilar(id: string, limit = 5) {
    const person = await this.findOne(id);
    const persons = await this.personRepo.find({ where: { published: true } });

    const scored = persons
      .filter((p) => p.id !== id)
      .map((other) => {
        let score = 0;
        const reasons: string[] = [];
        if (other.dynastyId === person.dynastyId) {
          score += 15;
          reasons.push('同一朝代');
        }
        const roleOverlap = (person.roles || []).filter((r) =>
          (other.roles || []).some(
            (or) => or.includes(r.slice(0, 2)) || r.includes(or.slice(0, 2)),
          ),
        );
        if (roleOverlap.length) {
          score += roleOverlap.length * 12;
          reasons.push(`同为${roleOverlap.join('、')}`);
        }
        if (
          Math.abs(
            (other.born + other.died) / 2 - (person.born + person.died) / 2,
          ) < 30
        ) {
          score += 8;
          reasons.push('活跃年代相近');
        }
        return { person: other, score, reasons };
      });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
