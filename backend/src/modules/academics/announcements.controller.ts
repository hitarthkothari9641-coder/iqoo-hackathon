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
import { AnnouncementAudience } from '@prisma/client';

export class CreateAnnouncementDto {
  title: string;
  content: string;
  audience?: AnnouncementAudience;
  targetId?: string;
}

@ApiTags('academic-announcements')
@Controller('academics/announcements')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AnnouncementsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get academic announcements' })
  async getAnnouncements(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.academicAnnouncement.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        author: {
          select: { firstName: true, lastName: true, displayName: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  @Post()
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Publish academic announcement' })
  async createAnnouncement(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAnnouncementDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.academicAnnouncement.create({
      data: {
        institutionId: req.user.institutionId,
        authorId: req.user.userId,
        title: dto.title,
        content: dto.content,
        audience: dto.audience || AnnouncementAudience.INSTITUTION,
        targetId: dto.targetId,
      },
    });
  }
}
