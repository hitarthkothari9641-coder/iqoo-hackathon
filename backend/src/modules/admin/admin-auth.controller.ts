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
import { SecurityEventService } from '../../common/logging/security-event.service';

export class AssignRoleDto {
  roleId: string;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AdminAuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityEventService: SecurityEventService,
  ) {}

  @Get('users')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'List institutional members (Admin view)' })
  async getUsers(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId && !req.user.isSuperAdmin) {
      throw new ForbiddenException({
        code: 'TENANT_CONTEXT_REQUIRED',
        message: 'Active institution context required',
      });
    }

    const whereCondition =
      req.user.isSuperAdmin && !req.user.institutionId
        ? {}
        : { memberships: { some: { institutionId: req.user.institutionId } } };

    return this.prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        status: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            institutionId: true,
            status: true,
            assignedRoles: {
              select: {
                role: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('memberships/:id')
  @RequirePermission('memberships.read')
  @ApiOperation({ summary: 'Get membership details by ID' })
  async getMembership(
    @Req() req: AuthenticatedRequest,
    @Param('id') membershipId: string,
  ) {
    const membership = await this.prisma.institutionMembership.findUnique({
      where: { id: membershipId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        institution: { select: { id: true, name: true, slug: true } },
        assignedRoles: { include: { role: true } },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Tenant Isolation Enforcement
    if (
      !req.user.isSuperAdmin &&
      membership.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException({
        code: 'TENANT_ACCESS_DENIED',
        message: 'Cannot access memberships outside your active institution',
      });
    }

    return membership;
  }

  @Post('memberships/:id/roles')
  @RequirePermission('roles.assign')
  @ApiOperation({ summary: 'Assign a role to a tenant membership' })
  async assignRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') membershipId: string,
    @Body() dto: AssignRoleDto,
  ) {
    const membership = await this.prisma.institutionMembership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Tenant Isolation Enforcement
    if (
      !req.user.isSuperAdmin &&
      membership.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException({
        code: 'TENANT_ACCESS_DENIED',
        message:
          'Cannot assign roles to memberships outside your active institution',
      });
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Privilege Escalation Prevention: College Admin CANNOT assign SUPER_ADMIN role!
    if (role.name === 'SUPER_ADMIN' && !req.user.isSuperAdmin) {
      throw new ForbiddenException({
        code: 'PRIVILEGE_ESCALATION_DENIED',
        message: 'Only platform Super Admins can assign SUPER_ADMIN role',
      });
    }

    const assigned = await this.prisma.membershipRole.upsert({
      where: {
        membershipId_roleId: {
          membershipId,
          roleId: dto.roleId,
        },
      },
      update: {},
      create: {
        membershipId,
        roleId: dto.roleId,
        assignedBy: req.user.userId,
      },
    });

    await this.securityEventService.logEvent({
      userId: req.user.userId,
      institutionId: membership.institutionId,
      eventType: 'ROLE_ASSIGNED',
      metadata: { targetUserId: membership.userId, roleName: role.name },
    });

    return assigned;
  }

  @Delete('memberships/:id/roles/:roleId')
  @RequirePermission('roles.assign')
  @ApiOperation({ summary: 'Revoke a role from a tenant membership' })
  async revokeRole(
    @Req() req: AuthenticatedRequest,
    @Param('id') membershipId: string,
    @Param('roleId') roleId: string,
  ) {
    const membership = await this.prisma.institutionMembership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (
      !req.user.isSuperAdmin &&
      membership.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException({
        code: 'TENANT_ACCESS_DENIED',
        message: 'Cannot revoke roles outside your active institution',
      });
    }

    await this.prisma.membershipRole.deleteMany({
      where: {
        membershipId,
        roleId,
      },
    });

    await this.securityEventService.logEvent({
      userId: req.user.userId,
      institutionId: membership.institutionId,
      eventType: 'ROLE_REVOKED',
      metadata: { membershipId, roleId },
    });

    return { message: 'Role revoked successfully' };
  }
}
