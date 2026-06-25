import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DynastiesService } from './dynasties.service';

@ApiTags('朝代')
@Controller('dynasties')
export class DynastiesController {
  constructor(private readonly dynastiesService: DynastiesService) {}

  @Get()
  findAll() {
    return this.dynastiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dynastiesService.findOne(id);
  }
}
