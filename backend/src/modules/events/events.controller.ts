import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
} from '../../common/guards/auth.guard';
import { PrismaService } from '../../database/prisma.service';
import { EventParticipationStatus } from '@prisma/client';

export class CreateEventDto {
  clubId?: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  capacity?: number;
}

export class RegisterEventDto {
  status?: EventParticipationStatus;
}

@ApiTags('events')
@Controller('events')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List upcoming campus events' })
  async getEvents(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.event.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        organizer: {
          select: { firstName: true, lastName: true, displayName: true },
        },
        club: { select: { name: true, logoUrl: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a campus event' })
  async createEvent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateEventDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.event.create({
      data: {
        institutionId: req.user.institutionId,
        organizerId: req.user.userId,
        clubId: dto.clubId,
        title: dto.title,
        description: dto.description,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        location: dto.location,
        capacity: dto.capacity || 100,
      },
    });
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Register for a campus event (GO/INTERESTED)' })
  async registerEvent(
    @Req() req: AuthenticatedRequest,
    @Param('id') eventId: string,
    @Body() dto: RegisterEventDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const currentCount = await this.prisma.eventRegistration.count({
      where: { eventId, status: 'GOING' },
    });

    let status = dto.status || EventParticipationStatus.GOING;
    if (
      status === EventParticipationStatus.GOING &&
      currentCount >= event.capacity
    ) {
      status = EventParticipationStatus.WAITLISTED;
    }

    return this.prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId, userId: req.user.userId } },
      update: { status },
      create: {
        eventId,
        userId: req.user.userId,
        status,
      },
    });
  }
}
