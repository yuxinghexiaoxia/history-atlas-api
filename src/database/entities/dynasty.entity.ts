import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dynasties')
export class Dynasty {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id: string;

  @Column({ type: 'varchar', length: 32 })
  name: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  englishName: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  span: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  founded: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  capital: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  ended: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'simple-json', nullable: true })
  stats: any[];

  @Column({ type: 'varchar', length: 16, default: 'partial' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
