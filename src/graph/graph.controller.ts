import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GraphService } from './graph.service';

@ApiTags('关系图谱')
@Controller('graphs')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get(':id')
  getGraph(@Param('id') id: string, @Query('depth') depth: string) {
    return this.graphService.getGraph(id, depth ? parseInt(depth, 10) : 1);
  }
}
