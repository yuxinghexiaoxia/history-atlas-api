import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('person_events')
@Unique(['personId', 'eventId'])
export class PersonEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32 })
  personId: string;

  @Column({ type: 'varchar', length: 32 })
  eventId: string;

  @Column({ type: 'varchar', length: 64, default: '参与' })
  role: string;
}
