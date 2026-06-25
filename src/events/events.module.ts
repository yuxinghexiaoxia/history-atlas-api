import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, Person, PersonEvent } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Person, PersonEvent])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
