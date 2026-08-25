import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
} from '../../common/guards/auth.guard';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto, SwitchInstitutionContextDto } from './dto/auth.dto';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('me')
@Controller('me')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get current authenticated user identity & security context',
  })
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        profileImageUrl: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    let activeInstitution = null;
    if (req.user.institutionId) {
      activeInstitution = await this.prisma.institution.findUnique({
        where: { id: req.user.institutionId },
        select: { id: true, name: true, slug: true, logoUrl: true },
      });
    }

    return {
      user,
      activeInstitution,
      roles: req.user.roles,
      permissions: req.user.permissions,
    };
  }

  @Get('institutions')
  @ApiOperation({
    summary: 'Get list of institutions where user holds active membership',
  })
  async getMyInstitutions(@Req() req: AuthenticatedRequest) {
    const memberships = await this.prisma.institutionMembership.findMany({
      where: {
        userId: req.user.userId,
        status: 'ACTIVE',
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            status: true,
          },
        },
        assignedRoles: {
          include: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      institution: m.institution,
      roles: m.assignedRoles.map((r) => r.role.name),
      joinedAt: m.joinedAt,
    }));
  }

  @Post('institution-context')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch active institutional context' })
  async switchContext(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SwitchInstitutionContextDto,
  ) {
    // Validate Membership Authorization
    const membership = await this.prisma.institutionMembership.findFirst({
      where: {
        userId: req.user.userId,
        institutionId: dto.institutionId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException({
        code: 'TENANT_ACCESS_DENIED',
        message:
          'You do not have an active membership in the requested institution',
      });
    }

    // Update active session institutionId context
    await this.prisma.session.update({
      where: { id: req.sessionId },
      data: { institutionId: dto.institutionId },
    });

    return {
      message: 'Institutional context switched successfully',
      institutionId: dto.institutionId,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get list of active device sessions' })
  async getSessions(@Req() req: AuthenticatedRequest) {
    return this.sessionService.getUserSessions(req.user.userId);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke specific device session' })
  async revokeSession(
    @Req() req: AuthenticatedRequest,
    @Param('id') sessionId: string,
  ) {
    await this.sessionService.revokeSession(sessionId, req.user.userId);
    return { message: 'Session revoked successfully' };
  }

  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all other active device sessions' })
  async revokeAllOtherSessions(@Req() req: AuthenticatedRequest) {
    await this.sessionService.revokeAllSessions(req.user.userId, req.sessionId);
    return { message: 'All other sessions revoked successfully' };
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, dto, req.sessionId);
  }
}
