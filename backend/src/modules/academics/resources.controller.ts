import {
  Controller,
  Get,
  Post,
  Delete,
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
  RequirePermission,
} from '../../common/guards/auth.guard';
import { PrismaService } from '../../database/prisma.service';
import { ResourceType, ResourceVisibility } from '@prisma/client';

export class CreateResourceDto {
  subjectId: string;
  title: string;
  description?: string;
  type?: ResourceType;
  fileUrl?: string;
  url?: string;
  visibility?: ResourceVisibility;
}

@ApiTags('course-resources')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('academics/resources')
  @ApiOperation({ summary: 'Get course resources' })
  async getResources(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.courseResource.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        subject: { select: { code: true, name: true } },
        faculty: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('faculty/resources')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Faculty: Publish course resource' })
  async createResource(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateResourceDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    const faculty = await this.prisma.facultyProfile.findFirst({
      where: { userId: req.user.userId, institutionId: req.user.institutionId },
    });

    if (!faculty) throw new ForbiddenException('Faculty profile required');

    return this.prisma.courseResource.create({
      data: {
        institutionId: req.user.institutionId,
        subjectId: dto.subjectId,
        facultyId: faculty.id,
        title: dto.title,
        description: dto.description,
        type: dto.type || ResourceType.DOCUMENT,
        fileUrl: dto.fileUrl,
        url: dto.url,
        visibility: dto.visibility || ResourceVisibility.ENROLLED_STUDENTS,
      },
    });
  }

  @Delete('faculty/resources/:id')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Faculty: Delete course resource' })
  async deleteResource(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const resource = await this.prisma.courseResource.findUnique({
      where: { id },
    });
    if (!resource) throw new NotFoundException('Resource not found');

    const faculty = await this.prisma.facultyProfile.findFirst({
      where: { userId: req.user.userId, institutionId: req.user.institutionId },
    });

    if (!faculty || resource.facultyId !== faculty.id) {
      throw new ForbiddenException(
        'Cannot delete resources published by another faculty member.',
      );
    }

    await this.prisma.courseResource.delete({ where: { id } });
    return { message: 'Resource deleted successfully' };
  }
}
