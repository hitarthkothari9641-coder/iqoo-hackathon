import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
} from '../../common/guards/auth.guard';
import { PrismaService } from '../../database/prisma.service';
import { ReportReason } from '@prisma/client';

export class FileReportDto {
  targetType: string; // POST, COMMENT, USER, COMMUNITY, CLUB
  targetId: string;
  reason?: ReportReason;
  description?: string;
}

@ApiTags('social-network')
@Controller('social')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NetworkController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('users/:id/follow')
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') followingId: string,
  ) {
    if (req.user.userId === followingId)
      throw new BadRequestException('Cannot follow yourself');

    return this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId,
        },
      },
      update: {},
      create: {
        followerId: req.user.userId,
        followingId,
      },
    });
  }

  @Delete('users/:id/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') followingId: string,
  ) {
    await this.prisma.follow.deleteMany({
      where: {
        followerId: req.user.userId,
        followingId,
      },
    });
    return { message: 'Unfollowed successfully' };
  }

  @Post('users/:id/block')
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') blockedId: string,
  ) {
    if (req.user.userId === blockedId)
      throw new BadRequestException('Cannot block yourself');

    return this.prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: req.user.userId,
          blockedId,
        },
      },
      update: {},
      create: {
        blockerId: req.user.userId,
        blockedId,
      },
    });
  }

  @Delete('users/:id/block')
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') blockedId: string,
  ) {
    await this.prisma.block.deleteMany({
      where: {
        blockerId: req.user.userId,
        blockedId,
      },
    });
    return { message: 'Unblocked successfully' };
  }

  @Get('discover')
  @ApiOperation({ summary: 'User and campus discovery' })
  async discoverUsers(
    @Req() req: AuthenticatedRequest,
    @Query('q') queryStr?: string,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [{ blockerId: req.user.userId }, { blockedId: req.user.userId }],
      },
    });
    const blockedUserIds = blocks.map((b) =>
      b.blockerId === req.user.userId ? b.blockedId : b.blockerId,
    );
    blockedUserIds.push(req.user.userId);

    const users = await this.prisma.user.findMany({
      where: {
        memberships: {
          some: { institutionId: req.user.institutionId, status: 'ACTIVE' },
        },
        id: { notIn: blockedUserIds },
        ...(queryStr
          ? {
              OR: [
                { firstName: { contains: queryStr, mode: 'insensitive' } },
                { lastName: { contains: queryStr, mode: 'insensitive' } },
                { displayName: { contains: queryStr, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        profileImageUrl: true,
        studentProfile: {
          select: {
            department: { select: { name: true } },
            program: { select: { name: true } },
          },
        },
      },
      take: 20,
    });

    return { users };
  }

  @Post('reports')
  @ApiOperation({ summary: 'File a safety/moderation report' })
  async fileReport(
    @Req() req: AuthenticatedRequest,
    @Body() dto: FileReportDto,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.report.create({
      data: {
        institutionId: req.user.institutionId,
        reporterId: req.user.userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason || ReportReason.SPAM,
        description: dto.description,
      },
    });
  }
}
