import { DataSource } from 'typeorm';
import {
  phase1Dynasties,
  phase1Persons,
  phase1Events,
  phase1Relations,
  phase1PersonEvents,
} from './seeds/phase1.seed';

const isSQLite = process.env.DB_TYPE === 'sqlite';

function buildDataSource() {
  if (isSQLite) {
    return new DataSource({
      type: 'sqlite',
      database: process.env.SQLITE_PATH || './history-atlas.db',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    });
  }
  return new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'lsxt',
    password: process.env.DB_PASSWORD || 'lsxt_secret',
    database: process.env.DB_NAME || 'history_atlas',
    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  });
}

const dataSource = buildDataSource();

async function seed() {
  await dataSource.initialize();

  // 1. 朝代
  const dynastyRepo = dataSource.getRepository('dynasties');
  for (const d of phase1Dynasties) {
    const existing = await dynastyRepo.findOne({ where: { id: d.id } });
    if (!existing) {
      await dynastyRepo.save(d);
      console.log('Inserted dynasty:', d.name);
    }
  }

  // 2. 人物
  const personRepo = dataSource.getRepository('persons');
  for (const p of phase1Persons) {
    const existing = await personRepo.findOne({ where: { id: p.id } });
    if (!existing) {
      await personRepo.save({
        id: p.id,
        name: p.name,
        alias: p.alias || null,
        born: p.born || null,
        died: p.died || null,
        dynastyId: p.dynastyId || null,
        roles: p.roles || [],
        shortIntro: p.shortIntro || null,
        fullIntro: p.fullIntro || null,
        achievements: p.achievements || [],
        controversy: (p as any).controversy || null,
        quote: p.quote || null,
        quoteSource: p.quoteSource || null,
        works: p.works || [],
        lifeEvents: p.lifeEvents || [],
        bioSections: (p as any).bioSections || [],
        classics: (p as any).classics || [],
        appraisals: (p as any).appraisals || [],
        worksDetail: (p as any).worksDetail || [],
        published: true,
      });
      console.log('Inserted person:', p.name);
    }
  }

  // 3. 事件
  const eventRepo = dataSource.getRepository('events');
  for (const e of phase1Events) {
    const existing = await eventRepo.findOne({ where: { id: e.id } });
    if (!existing) {
      await eventRepo.save({
        id: e.id,
        name: e.name,
        dynastyId: e.dynastyId || null,
        startYear: e.startYear || null,
        endYear: e.endYear || null,
        place: e.place || null,
        shortIntro: e.shortIntro || null,
        background: e.background || null,
        process: e.process || null,
        result: e.result || null,
        controversy: (e as any).controversy || null,
        chain: (e as any).chain || [],
        relatedEventIds: (e as any).relatedEventIds || [],
        published: true,
      });
      console.log('Inserted event:', e.name);
    }
  }

  // 4. 关系
  const relationRepo = dataSource.getRepository('relations');
  for (const r of phase1Relations) {
    const existing = await relationRepo.findOne({
      where: { sourceId: r.sourceId, targetId: r.targetId, relationType: r.relationType },
    });
    if (!existing) {
      await relationRepo.save({
        sourceId: r.sourceId,
        targetId: r.targetId,
        relationType: r.relationType,
        label: r.label || null,
        description: r.description || null,
      });
    }
  }

  // 5. 人物-事件关联
  const peRepo = dataSource.getRepository('person_events');
  for (const pe of phase1PersonEvents) {
    const existing = await peRepo.findOne({
      where: { personId: pe.personId, eventId: pe.eventId },
    });
    if (!existing) {
      await peRepo.save({
        personId: pe.personId,
        eventId: pe.eventId,
        role: pe.role || '参与',
      });
    }
  }

  console.log('Seed completed.');
  await dataSource.destroy();
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
