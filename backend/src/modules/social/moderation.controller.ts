import {
  Controller,
  Get,
  Post,
  Body,
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
import { ModerationActionType } from '@prisma/client';

export class TakeModerationActionDto {
  reportId: string;
  actionType: ModerationActionType;
  notes?: string;
}

@ApiTags('admin-moderation')
@Controller('admin/moderation')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('reports')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Admin: List open safety reports' })
  async getReports(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');

    return this.prisma.report.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        reporter: { select: { firstName: true, lastName: true, email: true } },
        actions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('action')
  @RequirePermission('users.read')
  @ApiOperation({
    summary: 'Admin: Execute moderation action with audit trail',
  })
  async takeAction(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TakeModerationActionDto,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: dto.reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    const action = await this.prisma.moderationAction.create({
      data: {
        reportId: dto.reportId,
        actorId: req.user.userId,
        actionType: dto.actionType,
        notes: dto.notes,
      },
    });

    await this.prisma.report.update({
      where: { id: dto.reportId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });

    return action;
  }
}
