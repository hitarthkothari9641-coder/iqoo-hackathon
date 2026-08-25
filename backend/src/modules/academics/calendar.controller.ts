import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
  RequirePermission,
} from '../../common/guards/auth.guard';
import { PrismaService } from '../../database/prisma.service';
import { CalendarEventType } from '@prisma/client';

export class CreateCalendarEventDto {
  title: string;
  description?: string;
  type?: CalendarEventType;
  startDate: string;
  endDate: string;
  isHoliday?: boolean;
}

@ApiTags('academic-calendar')
@Controller('academics/calendar')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get academic calendar events' })
  async getCalendarEvents(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.academicCalendarEvent.findMany({
      where: { institutionId: req.user.institutionId },
      orderBy: { startDate: 'asc' },
    });
  }

  @Post()
  @RequirePermission('users.read')
  @ApiOperation({
    summary: 'Create academic calendar event (Admin/Coordinator)',
  })
  async createCalendarEvent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCalendarEventDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.academicCalendarEvent.create({
      data: {
        institutionId: req.user.institutionId,
        title: dto.title,
        description: dto.description,
        type: dto.type || CalendarEventType.ACADEMIC_EVENT,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isHoliday: dto.isHoliday || false,
      },
    });
  }
}
