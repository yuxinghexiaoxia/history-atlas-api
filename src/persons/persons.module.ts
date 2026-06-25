import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { Person, Relation, Event, PersonEvent } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Relation, Event, PersonEvent])],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
