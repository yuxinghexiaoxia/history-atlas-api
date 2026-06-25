import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('后台管理')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  stats() {
    return this.adminService.stats();
  }

  @Post('persons/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  publishPerson(@Param('id') id: string, @Body() body: { published: boolean }) {
    return this.adminService.setPersonPublished(id, body.published ?? true);
  }

  @Post('events/:id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  publishEvent(@Param('id') id: string, @Body() body: { published: boolean }) {
    return this.adminService.setEventPublished(id, body.published ?? true);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  listUsers() {
    return this.adminService.listUsers();
  }
}
