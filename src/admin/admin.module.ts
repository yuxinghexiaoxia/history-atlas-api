import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person, Event, Dynasty, Relation, User } from '../database/entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Event, Dynasty, Relation, User])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
