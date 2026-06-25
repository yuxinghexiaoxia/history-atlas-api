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
import { Location } from './location.entity';

@Entity('events')
export class Event {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  dynastyId: string;

  @ManyToOne(() => Dynasty, { nullable: true })
  @JoinColumn({ name: 'dynasty_id' })
  dynasty: Dynasty;

  @Column({ type: 'int', nullable: true })
  startYear: number;

  @Column({ type: 'int', nullable: true })
  endYear: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  place: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  placeId: string;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'place_id' })
  location: Location;

  @Column({ type: 'text', nullable: true })
  shortIntro: string;

  @Column({ type: 'text', nullable: true })
  background: string;

  @Column({ type: 'text', nullable: true })
  process: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'text', nullable: true })
  controversy: string;

  @Column({ type: 'simple-json', nullable: true })
  chain: any[];

  @Column({ type: 'simple-json', default: '[]' })
  relatedEventIds: string[];

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
