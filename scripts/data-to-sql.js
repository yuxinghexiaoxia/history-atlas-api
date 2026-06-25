/* 将 website/data.js 转换为 PostgreSQL 种子 SQL */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../website/data.js');
const code = fs.readFileSync(dataPath, 'utf-8');

// eval data.js in minimal context
const window = {};
eval(code);
const DB = window.DB;

function q(s) { return s == null ? 'NULL' : "'" + String(s).replace(/'/g, "''") + "'"; }
function arr(a) { return a && a.length ? `ARRAY[${a.map(q).join(',')}]` : 'NULL'; }

let sql = `
-- 历史星图种子数据
-- 生成时间: ${new Date().toISOString()}

BEGIN;

TRUNCATE TABLE person_events, relations, sources, locations, events, persons, dynasties RESTART IDENTITY CASCADE;

`;

// dynasties
sql += `-- dynasties\n`;
DB.dynasties.forEach(d => {
  const info = DB.dynastyInfo[d.id] || {};
  sql += `INSERT INTO dynasties (id, name, full_name, english_name, span, founded, capital, ended, summary, stats, status) VALUES (${q(d.id)}, ${q(d.name)}, ${q(info.full || d.name + '朝')}, ${q(info.en || '')}, ${q(info.span || '')}, ${q(info.founded || '')}, ${q(info.capital || '')}, ${q(info.ended || '')}, ${q(info.summary || '')}, ${q(JSON.stringify(info.stats || []))}, ${q(info.status || 'partial')});\n`;
});

// locations
sql += `\n-- locations\n`;
Object.values(DB.locations).forEach(loc => {
  sql += `INSERT INTO locations (id, name, description) VALUES (${q(loc.id)}, ${q(loc.name)}, ${q(loc.desc || '')});\n`;
});

// persons
sql += `\n-- persons\n`;
Object.values(DB.persons).forEach(p => {
  const detail = p.detail || {};
  sql += `INSERT INTO persons (id, name, alias, born, died, dynasty, roles, short_intro, full_intro, achievements, controversy, quote, quote_source, works, life_events, bio_sections, classics, appraisals, works_detail) VALUES (${q(p.id)}, ${q(p.name)}, ${q(p.alias || '')}, ${p.born || 'NULL'}, ${p.died || 'NULL'}, ${q(p.dynasty || '')}, ${arr(p.role)}, ${q(p.short || '')}, ${q(p.intro || '')}, ${arr(p.achievements)}, ${q(p.controversy || '')}, ${q(p.quote || '')}, ${q(p.quoteSrc || '')}, ${arr(p.works)}, ${q(JSON.stringify(p.life || []))}, ${q(JSON.stringify(detail.bio || []))}, ${q(JSON.stringify(detail.classics || []))}, ${q(JSON.stringify(detail.appraisals || []))}, ${q(JSON.stringify(detail.worksDetail || []))});\n`;
});

// events
sql += `\n-- events\n`;
Object.values(DB.events).forEach(e => {
  sql += `INSERT INTO events (id, name, dynasty, start_year, end_year, place, place_id, short_intro, background, process, result, controversy, chain, related_event_ids) VALUES (${q(e.id)}, ${q(e.name)}, ${q(e.dynasty || '')}, ${e.start || 'NULL'}, ${e.end || 'NULL'}, ${q(e.place || '')}, ${q(e.placeId || '')}, ${q(e.short || '')}, ${q(e.bg || '')}, ${q(e.process || '')}, ${q(e.result || '')}, ${q(e.controversy || '')}, ${q(JSON.stringify(e.chain || []))}, ${arr(e.related)});\n`;
});

// person_events
sql += `\n-- person_events\n`;
Object.values(DB.persons).forEach(p => {
  (p.events || []).forEach(evId => {
    sql += `INSERT INTO person_events (person_id, event_id, role) VALUES (${q(p.id)}, ${q(evId)}, '参与');\n`;
  });
});

// relations
sql += `\n-- relations\n`;
Object.values(DB.persons).forEach(p => {
  (p.relations || []).forEach(r => {
    sql += `INSERT INTO relations (source_id, target_id, relation_type, label, description) VALUES (${q(p.id)}, ${q(r.to)}, ${q(r.type)}, ${q(r.label || '')}, ${q(r.desc || '')});\n`;
  });
});

// sources
sql += `\n-- sources\n`;
const seen = new Set();
Object.values(DB.persons).concat(Object.values(DB.events)).forEach(ent => {
  (ent.sources || []).forEach(s => {
    const key = s.t + '|' + s.lv;
    if (seen.has(key)) return;
    seen.add(key);
    sql += `INSERT INTO sources (title, level, entity_type, entity_id) VALUES (${q(s.t)}, ${q(s.lv)}, ${q(ent.type)}, ${q(ent.id)});\n`;
  });
});

sql += `\nCOMMIT;\n`;

const outPath = path.join(__dirname, '../seed.sql');
fs.writeFileSync(outPath, sql);
console.log('Generated', outPath, `(${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
