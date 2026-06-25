import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event, PersonEvent } from '../database/entities';

export interface TimelineItem {
  y: number;
  key: boolean;
  type: 'event' | 'war' | 'person';
  t: string;
  s: string;
  ev?: string;
  pr?: string;
}

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(PersonEvent) private peRepo: Repository<PersonEvent>,
  ) {}

  async findAll(filter?: {
    type?: string;
    personId?: string;
    dynastyId?: string;
  }): Promise<TimelineItem[]> {
    let eventQuery = this.eventRepo
      .createQueryBuilder('e')
      .where('e.published = true');
    if (filter?.dynastyId)
      eventQuery = eventQuery.andWhere('e.dynasty_id = :dynastyId', {
        dynastyId: filter.dynastyId,
      });
    const events = await eventQuery.getMany();

    const items: TimelineItem[] = events.map((e) => ({
      y: e.startYear || e.endYear || 0,
      key: true,
      type: e.id.includes('war') || ['jiawu'].includes(e.id) ? 'war' : 'event',
      t: e.name,
      s: e.shortIntro || '',
      ev: e.id,
    }));

    if (filter?.personId) {
      const links = await this.peRepo.find({
        where: { personId: filter.personId },
      });
      const eventIds = links.map((l) => l.eventId);
      return items.filter((it) => it.ev && eventIds.includes(it.ev));
    }

    if (filter?.type && filter.type !== 'all') {
      return items.filter((it) => it.type === filter.type);
    }

    return items.sort((a, b) => a.y - b.y);
  }
}
