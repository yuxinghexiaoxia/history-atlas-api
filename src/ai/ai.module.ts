import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person, Event, Dynasty } from '../database/entities';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person, Event, Dynasty])],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
