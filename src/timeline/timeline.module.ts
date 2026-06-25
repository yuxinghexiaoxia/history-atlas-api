import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { Person, Event, PersonEvent } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Event, PersonEvent])],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
