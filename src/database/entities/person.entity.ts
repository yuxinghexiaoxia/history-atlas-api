import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dynasty } from './dynasty.entity';

@Entity('persons')
export class Person {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  alias: string;

  @Column({ type: 'int', nullable: true })
  born: number;

  @Column({ type: 'int', nullable: true })
  died: number;

  @Column({ type: 'varchar', length: 32, nullable: true })
  dynastyId: string;

  @ManyToOne(() => Dynasty, { nullable: true })
  @JoinColumn({ name: 'dynasty_id' })
  dynasty: Dynasty;

  @Column({ type: 'simple-json', default: '[]' })
  roles: string[];

  @Column({ type: 'text', nullable: true })
  shortIntro: string;

  @Column({ type: 'text', nullable: true })
  fullIntro: string;

  @Column({ type: 'simple-json', default: '[]' })
  achievements: string[];

  @Column({ type: 'text', nullable: true })
  controversy: string;

  @Column({ type: 'text', nullable: true })
  quote: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  quoteSource: string;

  @Column({ type: 'simple-json', default: '[]' })
  works: string[];

  @Column({ type: 'simple-json', nullable: true })
  lifeEvents: any[];

  @Column({ type: 'simple-json', nullable: true })
  bioSections: any[];

  @Column({ type: 'simple-json', nullable: true })
  classics: any[];

  @Column({ type: 'simple-json', nullable: true })
  appraisals: any[];

  @Column({ type: 'simple-json', nullable: true })
  worksDetail: any[];

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
