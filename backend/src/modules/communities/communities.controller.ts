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
import { CommunityVisibility } from '@prisma/client';

export class CreateCommunityDto {
  name: string;
  description: string;
  category: string;
  visibility?: CommunityVisibility;
  iconUrl?: string;
  coverUrl?: string;
}

@ApiTags('communities')
@Controller('communities')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CommunitiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List college communities' })
  async getCommunities(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.community.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        owner: {
          select: { firstName: true, lastName: true, displayName: true },
        },
      },
      orderBy: { membersCount: 'desc' },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a campus community' })
  async createCommunity(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCommunityDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    const community = await this.prisma.community.create({
      data: {
        institutionId: req.user.institutionId,
        ownerId: req.user.userId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        visibility: dto.visibility || CommunityVisibility.PUBLIC_WITHIN_COLLEGE,
        iconUrl: dto.iconUrl,
        coverUrl: dto.coverUrl,
      },
    });

    await this.prisma.communityMembership.create({
      data: {
        communityId: community.id,
        userId: req.user.userId,
        role: 'OWNER',
        status: 'OWNER',
      },
    });

    return community;
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a community' })
  async joinCommunity(
    @Req() req: AuthenticatedRequest,
    @Param('id') communityId: string,
  ) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) throw new NotFoundException('Community not found');

    const membership = await this.prisma.communityMembership.upsert({
      where: { communityId_userId: { communityId, userId: req.user.userId } },
      update: {},
      create: {
        communityId,
        userId: req.user.userId,
        role: 'MEMBER',
        status: 'MEMBER',
      },
    });

    await this.prisma.community.update({
      where: { id: communityId },
      data: { membersCount: { increment: 1 } },
    });

    return membership;
  }
}
