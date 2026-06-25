import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynastiesController } from './dynasties.controller';
import { DynastiesService } from './dynasties.service';
import { Dynasty, Person, Event } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Dynasty, Person, Event])],
  controllers: [DynastiesController],
  providers: [DynastiesService],
})
export class DynastiesModule {}
