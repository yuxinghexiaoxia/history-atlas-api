/* ============================================
   历史星图 · 数据批量导入脚本（升级版）
   扫描 data/ 目录下所有 JSON 文件，合并后导入 SQLite
   ============================================ */
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../history-atlas.db');
const dataDir = path.join(__dirname, '../data');
const db = new sqlite3.Database(dbPath);

function j(v) { return v == null ? null : JSON.stringify(v); }

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// 递归扫描 data/ 目录下的所有 .json 文件（排除 .gitkeep、规范文档等）
function scanDataFiles(dir) {
  const files = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files.sort();
}

// 合并所有 JSON 文件的数据
function mergeData(files) {
  const merged = {
    persons: {},
    events: {},
    locations: {},
    dynasties: [],
    timeline: [],
    hotPersons: [],
    hotEvents: [],
    relMeta: {},
    dynastyInfo: {}
  };

  for (const file of files) {
    console.log(`  Loading: ${path.relative(dataDir, file)}`);
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));

    if (content.persons) Object.assign(merged.persons, content.persons);
    if (content.events) Object.assign(merged.events, content.events);
    if (content.locations) Object.assign(merged.locations, content.locations);
    if (content.dynasties) merged.dynasties.push(...content.dynasties);
    if (content.timeline) merged.timeline.push(...content.timeline);
    if (content.hotPersons) merged.hotPersons.push(...content.hotPersons);
    if (content.hotEvents) merged.hotEvents.push(...content.hotEvents);
    if (content.relMeta) Object.assign(merged.relMeta, content.relMeta);
    if (content.dynastyInfo) Object.assign(merged.dynastyInfo, content.dynastyInfo);
  }

  // 去重
  merged.dynasties = Array.from(new Map(merged.dynasties.map(d => [d.id, d])).values());
  merged.timeline = merged.timeline.sort((a, b) => (a.y || 0) - (b.y || 0));
  merged.hotPersons = [...new Set(merged.hotPersons)];
  merged.hotEvents = [...new Set(merged.hotEvents)];

  return merged;
}

// 保留 website/data.js 兼容的导出（用于前端）
function generateWebsiteData(merged) {
  const websiteDataPath = path.join(__dirname, '../../website/data.js');

  // 如果 website/data.js 存在，尝试更新它（保留原有格式，只替换数据）
  if (fs.existsSync(websiteDataPath)) {
    console.log(`\n  Updating website/data.js ...`);

    const persons = Object.values(merged.persons);
    const events = Object.values(merged.events);
    const locations = Object.values(merged.locations);
    const dynasties = merged.dynasties;

    // 构建 dynastyInfo 映射
    const dynastyInfo = {};
    for (const d of dynasties) {
      dynastyInfo[d.id] = merged.dynastyInfo[d.id] || { id: d.id, name: d.name, full: d.name + '朝', status: 'partial' };
    }

    // 构建 timeline（从 person life + events 自动生成）
    const timeline = [];
    for (const p of persons) {
      for (const ev of (p.life || [])) {
        timeline.push({
          y: ev.y, key: ev.key || false, type: 'person',
          t: ev.t, s: ev.s, pr: p.id, md: ev.md || null
        });
      }
    }
    for (const e of events) {
      if (e.start) {
        timeline.push({
          y: e.start, key: true, type: 'event',
          t: e.name, s: e.short || '', ev: e.id, md: e.md || null
        });
      }
    }
    timeline.sort((a, b) => a.y - b.y);

    const hotPersons = persons.filter(p => p.hot).map(p => p.id).filter(Boolean);
    const hotEvents = events.filter(e => e.hot).map(e => e.id).filter(Boolean);

    const dataJs = `/* ============ 历史星图 · 数据集 ============ */
/* 数据来源：二十四史人物与事件。来源等级 A原始史料 B权威整理 C通俗资料 D待校验 */
window.DB = (function(){

const persons = ${JSON.stringify(merged.persons, null, 2)};

const events = ${JSON.stringify(merged.events, null, 2)};

const locations = ${JSON.stringify(merged.locations, null, 2)};

const dynasties = ${JSON.stringify(dynasties, null, 2)};

const timeline = ${JSON.stringify(timeline, null, 2)};

const hotPersons = ${JSON.stringify(hotPersons.length > 0 ? hotPersons : persons.slice(0, 6).map(p => p.id), null, 2)};
const hotEvents = ${JSON.stringify(hotEvents.length > 0 ? hotEvents : events.slice(0, 4).map(e => e.id), null, 2)};

const relMeta = ${JSON.stringify(merged.relMeta || {
  TEACHER_OF:{label:"师生",color:"var(--rel-teacher)",w:3,dash:""},
  STUDENT_OF:{label:"师生",color:"var(--rel-teacher)",w:3,dash:""},
  COLLEAGUE_OF:{label:"同僚",color:"var(--rel-colleague)",w:2.5,dash:""},
  RIVAL_OF:{label:"敌对/政争",color:"var(--rel-rival)",w:2.5,dash:"6 5"},
  SERVE_AS:{label:"君臣",color:"var(--rel-serve)",w:2,dash:""},
  SPOUSE_OF:{label:"亲属",color:"var(--rel-kin)",w:2.5,dash:""},
  PARTICIPATED_IN:{label:"参与事件",color:"var(--rel-event)",w:2,dash:"2 5"},
  LED:{label:"领导",color:"var(--rel-event)",w:3,dash:""}
}, null, 2)};

const dynastyInfo = ${JSON.stringify(dynastyInfo, null, 2)};

return { persons, events, locations, dynasties, timeline, hotPersons, hotEvents, relMeta, dynastyInfo };
})();
`;
    fs.writeFileSync(websiteDataPath, dataJs);
    console.log(`  ✓ Updated ${path.relative(path.join(__dirname, '../'), websiteDataPath)}`);
  }
}

async function seed() {
  console.log('========================================');
  console.log('  历史星图 · 数据批量导入');
  console.log('========================================');

  // 1. 扫描数据文件
  console.log('\n[1/6] Scanning data files...');
  const files = scanDataFiles(dataDir);
  console.log(`  Found ${files.length} data file(s)`);
  if (files.length === 0) {
    console.log('  No data files found. Create JSON files in server/data/ directory first.');
    console.log('  See server/data/录入规范.md for format specification.');
    db.close();
    return;
  }

  // 2. 合并数据
  console.log('\n[2/6] Merging data...');
  const merged = mergeData(files);
  console.log(`  Persons: ${Object.keys(merged.persons).length}`);
  console.log(`  Events: ${Object.keys(merged.events).length}`);
  console.log(`  Locations: ${Object.keys(merged.locations).length}`);
  console.log(`  Dynasties: ${merged.dynasties.length}`);

  // 3. 清空现有数据
  console.log('\n[3/6] Clearing existing data...');
  await run('DELETE FROM sources');
  await run('DELETE FROM person_events');
  await run('DELETE FROM relations');
  await run('DELETE FROM events');
  await run('DELETE FROM persons');
  await run('DELETE FROM locations');
  await run('DELETE FROM dynasties');
  console.log('  ✓ Cleared');

  // 4. 插入 dynasties
  console.log('\n[4/6] Inserting dynasties...');
  const dynastyIds = new Set();
  for (const d of merged.dynasties) {
    const info = merged.dynastyInfo[d.id] || {};
    await run(
      `INSERT INTO dynasties (id, name, fullName, englishName, span, founded, capital, ended, summary, stats, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.name, info.full || d.name + '朝', info.en || '', info.span || '', info.founded || '', info.capital || '', info.ended || '', info.summary || '', j(info.stats), info.status || 'partial']
    );
    dynastyIds.add(d.id);
  }
  console.log(`  ✓ Inserted ${merged.dynasties.length} dynasties`);

  // 5. 插入 locations
  console.log('\n[5/6] Inserting locations...');
  for (const loc of Object.values(merged.locations)) {
    await run(
      `INSERT INTO locations (id, name, description) VALUES (?, ?, ?)`,
      [loc.id, loc.name, loc.desc || '']
    );
  }
  console.log(`  ✓ Inserted ${Object.values(merged.locations).length} locations`);

  // 6. 插入 persons
  console.log('\n  Inserting persons...');
  let personCount = 0;
  for (const p of Object.values(merged.persons)) {
    const detail = p.detail || {};
    await run(
      `INSERT INTO persons (id, name, alias, born, died, dynastyId, roles, shortIntro, fullIntro, achievements, controversy, quote, quoteSource, works, lifeEvents, bioSections, classics, appraisals, worksDetail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.alias || '', p.born || null, p.died || null, p.dynasty || '', j(p.role), p.short || '', p.intro || '', j(p.achievements), p.controversy || '', p.quote || '', p.quoteSrc || '', j(p.works), j(p.life), j(detail.bio), j(detail.classics), j(detail.appraisals), j(detail.worksDetail)]
    );
    personCount++;
  }
  console.log(`  ✓ Inserted ${personCount} persons`);

  // 7. 插入 events
  console.log('  Inserting events...');
  let eventCount = 0;
  for (const e of Object.values(merged.events)) {
    await run(
      `INSERT INTO events (id, name, dynastyId, startYear, endYear, place, placeId, shortIntro, background, process, result, controversy, chain, relatedEventIds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.id, e.name, e.dynasty || '', e.start || null, e.end || null, e.place || '', e.placeId || '', e.short || '', e.bg || '', e.process || '', e.result || '', e.controversy || '', j(e.chain), j(e.related)]
    );
    eventCount++;
  }
  console.log(`  ✓ Inserted ${eventCount} events`);

  // 8. 插入 person_events
  console.log('  Inserting person_events...');
  let peCount = 0;
  for (const p of Object.values(merged.persons)) {
    for (const evId of (p.events || [])) {
      await run(
        `INSERT INTO person_events (personId, eventId, role) VALUES (?, ?, ?)`,
        [p.id, evId, '参与']
      );
      peCount++;
    }
  }
  console.log(`  ✓ Inserted ${peCount} person_events`);

  // 9. 插入 relations
  console.log('  Inserting relations...');
  let relCount = 0;
  for (const p of Object.values(merged.persons)) {
    for (const r of (p.relations || [])) {
      await run(
        `INSERT INTO relations (sourceId, targetId, relationType, label, description) VALUES (?, ?, ?, ?, ?)`,
        [p.id, r.to, r.type, r.label || '', r.desc || '']
      );
      relCount++;
    }
  }
  console.log(`  ✓ Inserted ${relCount} relations`);

  // 10. 插入 sources
  console.log('  Inserting sources...');
  const seen = new Set();
  let srcCount = 0;
  for (const ent of Object.values(merged.persons).concat(Object.values(merged.events))) {
    for (const s of (ent.sources || [])) {
      const key = s.t + '|' + s.lv;
      if (seen.has(key)) continue;
      seen.add(key);
      await run(
        `INSERT INTO sources (title, level, entityType, entityId) VALUES (?, ?, ?, ?)`,
        [s.t, s.lv, ent.type, ent.id]
      );
      srcCount++;
    }
  }
  console.log(`  ✓ Inserted ${srcCount} sources`);

  // 11. 验证数据
  console.log('\n[6/6] Verifying data...');
  const stats = await all(`
    SELECT 'persons' as table_name, COUNT(*) as cnt FROM persons
    UNION ALL SELECT 'events', COUNT(*) FROM events
    UNION ALL SELECT 'dynasties', COUNT(*) FROM dynasties
    UNION ALL SELECT 'locations', COUNT(*) FROM locations
    UNION ALL SELECT 'relations', COUNT(*) FROM relations
    UNION ALL SELECT 'person_events', COUNT(*) FROM person_events
    UNION ALL SELECT 'sources', COUNT(*) FROM sources
  `);
  for (const s of stats) {
    console.log(`  ${s.table_name}: ${s.cnt}`);
  }

  // 12. 更新前端数据文件
  console.log('\n  Updating frontend data...');
  generateWebsiteData(merged);

  console.log('\n========================================');
  console.log('  ✓ 导入完成！');
  console.log('  下一步：git add data/ history-atlas.db website/data.js');
  console.log('         git commit -m "data: 添加..."');
  console.log('         git push origin main');
  console.log('========================================');

  db.close();
}

seed().catch(err => {
  console.error('Seed error:', err);
  db.close();
  process.exit(1);
});
