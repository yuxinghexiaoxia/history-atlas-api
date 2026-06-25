import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';

@ApiTags('时间线')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('personId') personId?: string,
    @Query('dynastyId') dynastyId?: string,
  ) {
    return this.timelineService.findAll({ type, personId, dynastyId });
  }
}
