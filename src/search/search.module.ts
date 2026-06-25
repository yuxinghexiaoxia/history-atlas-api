import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Person, Event, Dynasty } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Event, Dynasty])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
