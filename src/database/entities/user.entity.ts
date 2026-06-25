import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 256, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 256 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 16, default: 'free' })
  plan: string;

  @Column({ type: 'datetime', nullable: true })
  planExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
