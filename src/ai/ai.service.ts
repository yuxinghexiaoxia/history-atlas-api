import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person, Event, Dynasty } from '../database/entities';

export type AiAnswerKind = 'list' | 'outline' | 'insufficient';

export interface AiAnswer {
  kind: AiAnswerKind;
  title: string;
  lead: string;
  items: { h: string; d: string }[];
  cites: { lv: string; t: string }[];
  links: [string, string, string][];
}

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Person) private personRepo: Repository<Person>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Dynasty) private dynastyRepo: Repository<Dynasty>,
  ) {}

  async chat(question: string): Promise<AiAnswer> {
    const q = question.trim();
    if (!q) return this.insufficient('空问题');

    const keywords = await this.extractKeywords(q);
    const person = keywords.person;
    const event = keywords.event;

    if (/选题|爆点|标题|选题/.test(q)) {
      return this.genTopics(person || '李鸿章');
    }
    if (/大纲|文章|写一篇/.test(q) && person) {
      return this.genOutline(person);
    }
    if (/脚本|视频|分镜|讲解/.test(q)) {
      const subject = event || person;
      if (subject) return this.genScript(subject);
    }
    if (/相似|类似|像/.test(q) && person) {
      return this.genSimilar(person);
    }
    const yearMatch = q.match(/\d{3,4}/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0], 10);
      return this.genYearOverview(year);
    }

    return this.insufficient(q);
  }

  private async extractKeywords(q: string) {
    const persons = await this.personRepo.find({ where: { published: true } });
    const events = await this.eventRepo.find({ where: { published: true } });
    const foundPerson = persons.find(
      (p) =>
        q.includes(p.name) ||
        (p.alias && p.alias.split('·').some((a) => q.includes(a.trim()))),
    );
    const foundEvent = events.find((e) => q.includes(e.name));
    return { person: foundPerson?.name, event: foundEvent?.name };
  }

  private genTopics(personName: string): AiAnswer {
    return {
      kind: 'list',
      title: `为「${personName}」生成的 5 个公众号选题`,
      lead: '基于站内结构化资料，结合争议度与搜索热度，为你筛选了高潜力角度：',
      items: [
        {
          h: `① ${personName}的功过，为什么至今吵不完？`,
          d: '从争议事件切入，引出人物评价的多元视角。',
        },
        {
          h: `② 一个人撑起半个时代：${personName}的权力网络`,
          d: '用关系图谱串联师友、政敌、同乡，做人物群像。',
        },
        {
          h: `③ ${personName}最关键的一场仗/一次决策`,
          d: '聚焦转折性事件，讲清前因后果。',
        },
        {
          h: `④ 从${personName}看一个时代的困境`,
          d: '把个人命运放进朝代制度与外部环境里解读。',
        },
        {
          h: `⑤ 如果${personName}活在当下？`,
          d: '借古喻今，适合短视频的强情绪钩子。',
        },
      ],
      cites: [{ lv: 'B', t: '站内结构化资料与关系图谱' }],
      links: [],
    };
  }

  private genOutline(personName: string): AiAnswer {
    return {
      kind: 'outline',
      title: `《${personName}：一个时代的人物侧影》· 文章大纲`,
      lead: '建议 2500–3000 字，配人物年表与关系图谱配图。结构如下：',
      items: [
        { h: '导语 · 一句话定调', d: '用一句人物名言或争议点切入，立人设。' },
        { h: '一、出身与早期经历', d: '家庭背景、科举/入仕路径，铺陈底色。' },
        { h: '二、关键转折与核心功业', d: '选取 1–2 个决定性事件展开。' },
        { h: '三、关系网络与政敌盟友', d: '引用站内关系图谱，串联关键人物。' },
        {
          h: '四、争议与后世评价',
          d: '呈现不同史料与后世视角，避免单一叙事。',
        },
        { h: '结语 · 历史坐标中的位置', d: '回扣主题，升华到时代层面。' },
      ],
      cites: [{ lv: 'B', t: '站内人物库与事件链' }],
      links: [],
    };
  }

  private genScript(subject: string): AiAnswer {
    return {
      kind: 'outline',
      title: `短视频脚本 ·《${subject}》`,
      lead: '时长约 3 分钟，竖屏。分镜与旁白如下：',
      items: [
        {
          h: '0:00 开场钩子',
          d: `旁白：「关于${subject}，有一个被忽略的视角。」画面：人物画像/事件场景。`,
        },
        { h: '0:20 背景铺垫', d: '快速交代时代背景与人物处境。' },
        { h: '1:00 核心冲突', d: '讲述关键事件，制造情绪张力。' },
        { h: '1:50 转折与高潮', d: '决定性瞬间，配合史料原文。' },
        { h: '2:30 影响与升华', d: '引出对后世的改变，预告下集。' },
      ],
      cites: [{ lv: 'B', t: '站内事件库与时间线' }],
      links: [],
    };
  }

  private genSimilar(personName: string): AiAnswer {
    return {
      kind: 'list',
      title: `与「${personName}」相似的历史人物`,
      lead: '按朝代身份、事件参与、历史评价与图谱关系综合计算：',
      items: [
        {
          h: '站内相似度算法（占位）',
          d: '请先录入更多人物数据以启用真实相似度计算。',
        },
      ],
      cites: [{ lv: 'B', t: '站内关系图谱与标签相似度' }],
      links: [],
    };
  }

  private async genYearOverview(year: number): Promise<AiAnswer> {
    const events = await this.eventRepo.find({ where: { published: true } });
    const matched = events
      .filter((e) => e.startYear <= year && e.endYear >= year)
      .slice(0, 5);
    const persons = await this.personRepo.find({ where: { published: true } });
    const bornDied = persons
      .filter((p) => p.born === year || p.died === year)
      .slice(0, 5);

    if (matched.length === 0 && bornDied.length === 0) {
      return this.insufficient(String(year));
    }

    return {
      kind: 'list',
      title: `${year} 年 · 这一年发生了什么`,
      lead: '站内收录的该年关键节点：',
      items: [
        ...matched.map((e) => ({
          h: e.name,
          d: e.shortIntro || '详见事件详情页。',
        })),
        ...bornDied.map((p) => ({
          h: p.born === year ? `${p.name} 出生` : `${p.name} 去世`,
          d: p.shortIntro || '',
        })),
      ],
      cites: [{ lv: 'B', t: '站内时间线数据' }],
      links: matched.map(
        (e) => ['event', e.id, e.name] as [string, string, string],
      ),
    };
  }

  private insufficient(subject: string): AiAnswer {
    return {
      kind: 'insufficient',
      title: '站内资料暂不足以充分回答',
      lead: `关于「${subject}」，当前知识库尚未收录足够的结构化资料。AI 不会无来源扩写关键史实。`,
      items: [
        {
          h: '你可以尝试',
          d: '搜索已收录的人物/事件/年份，或补充更多结构化资料后再提问。',
        },
      ],
      cites: [],
      links: [],
    };
  }
}
