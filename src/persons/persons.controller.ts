import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PersonsService } from './persons.service';

@ApiTags('人物')
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get()
  findAll() {
    return this.personsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personsService.findOne(id);
  }

  @Get(':id/relations')
  getRelations(@Param('id') id: string) {
    return this.personsService.getRelations(id);
  }

  @Get(':id/events')
  getEvents(@Param('id') id: string) {
    return this.personsService.getEvents(id);
  }

  @Get(':id/similar')
  getSimilar(@Param('id') id: string, @Query('limit') limit: string) {
    return this.personsService.getSimilar(id, limit ? parseInt(limit, 10) : 5);
  }
}
