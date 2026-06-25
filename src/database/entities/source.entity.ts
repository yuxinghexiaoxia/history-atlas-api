import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512 })
  title: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  level: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  entityType: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  volume: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  page: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  url: string;

  @CreateDateColumn()
  createdAt: Date;
}
