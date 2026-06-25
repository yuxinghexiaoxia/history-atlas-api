import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Person, Event, Dynasty } from '../database/entities';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Person) private personRepo: Repository<Person>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Dynasty) private dynastyRepo: Repository<Dynasty>,
  ) {}

  async search(q: string) {
    const keyword = `%${q}%`;
    const year = /^-?\d{1,4}$/.test(q) ? parseInt(q, 10) : null;

    const [persons, events, dynasties] = await Promise.all([
      this.personRepo
        .createQueryBuilder('p')
        .where('p.published = true')
        .andWhere(
          new Brackets((qb) => {
            qb.where('p.name ILIKE :k', { k: keyword })
              .orWhere('p.alias ILIKE :k', { k: keyword })
              .orWhere('p.short_intro ILIKE :k', { k: keyword })
              .orWhere('p.full_intro ILIKE :k', { k: keyword });
            if (year != null)
              qb.orWhere('p.born <= :y AND p.died >= :y', { y: year });
          }),
        )
        .limit(20)
        .getMany(),
      this.eventRepo
        .createQueryBuilder('e')
        .where('e.published = true')
        .andWhere(
          new Brackets((qb) => {
            qb.where('e.name ILIKE :k', { k: keyword })
              .orWhere('e.place ILIKE :k', { k: keyword })
              .orWhere('e.short_intro ILIKE :k', { k: keyword })
              .orWhere('e.background ILIKE :k', { k: keyword });
            if (year != null)
              qb.orWhere('e.start_year <= :y AND e.end_year >= :y', {
                y: year,
              });
          }),
        )
        .limit(20)
        .getMany(),
      this.dynastyRepo
        .createQueryBuilder('d')
        .where(
          'd.name ILIKE :k OR d.full_name ILIKE :k OR d.summary ILIKE :k',
          { k: keyword },
        )
        .limit(10)
        .getMany(),
    ]);

    return { persons, events, dynasties, query: q, isYear: year != null };
  }
}
