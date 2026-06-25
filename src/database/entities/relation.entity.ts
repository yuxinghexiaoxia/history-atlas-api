import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('relations')
export class Relation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  sourceId: string;

  @Column({ type: 'varchar', length: 32 })
  targetId: string;

  @Column({ type: 'varchar', length: 64 })
  relationType: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  sourceRef: string;

  @Column({ type: 'int', nullable: true })
  startYear: number;

  @Column({ type: 'int', nullable: true })
  endYear: number;

  @CreateDateColumn()
  createdAt: Date;
}
