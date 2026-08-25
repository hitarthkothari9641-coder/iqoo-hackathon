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
import { ClubStatus, ClubRole } from '@prisma/client';

export class CreateClubDto {
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
}

@ApiTags('clubs')
@Controller('clubs')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ClubsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List approved active clubs' })
  async getClubs(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.club.findMany({
      where: {
        institutionId: req.user.institutionId,
        status: ClubStatus.ACTIVE,
      },
      include: {
        facultyAdvisor: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { membersCount: 'desc' },
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Request creation of a new college club (Pending Admin Approval)',
  })
  async createClub(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateClubDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    const club = await this.prisma.club.create({
      data: {
        institutionId: req.user.institutionId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        logoUrl: dto.logoUrl,
        status: ClubStatus.PENDING,
      },
    });

    await this.prisma.clubMembership.create({
      data: {
        clubId: club.id,
        userId: req.user.userId,
        role: ClubRole.PRESIDENT,
      },
    });

    return club;
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an active club' })
  async joinClub(
    @Req() req: AuthenticatedRequest,
    @Param('id') clubId: string,
  ) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');

    const membership = await this.prisma.clubMembership.upsert({
      where: { clubId_userId: { clubId, userId: req.user.userId } },
      update: {},
      create: {
        clubId,
        userId: req.user.userId,
        role: ClubRole.MEMBER,
      },
    });

    await this.prisma.club.update({
      where: { id: clubId },
      data: { membersCount: { increment: 1 } },
    });

    return membership;
  }
}
