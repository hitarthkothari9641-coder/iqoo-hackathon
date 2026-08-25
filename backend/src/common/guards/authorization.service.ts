import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface AuthenticatedUserContext {
  userId: string;
  institutionId?: string;
  membershipId?: string;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
}

export type PermissionScope =
  'SELF' | 'OWN' | 'ASSIGNED' | 'DEPARTMENT' | 'INSTITUTION' | 'PLATFORM';

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getEffectiveUserContext(
    userId: string,
    requestedInstitutionId?: string,
  ): Promise<AuthenticatedUserContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            assignedRoles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        userId,
        roles: [],
        permissions: [],
        isSuperAdmin: false,
      };
    }

    // Determine target active institution membership
    let activeMembership = user.memberships.find(
      (m) =>
        m.institutionId === requestedInstitutionId && m.status === 'ACTIVE',
    );

    // Default to first active membership if not specified or invalid
    if (!activeMembership) {
      activeMembership = user.memberships.find((m) => m.status === 'ACTIVE');
    }

    const roles: string[] = [];
    const permissionSet = new Set<string>();

    if (activeMembership) {
      for (const mRole of activeMembership.assignedRoles) {
        // Check if role assignment hasn't expired
        if (mRole.expiresAt && mRole.expiresAt < new Date()) {
          continue;
        }

        roles.push(mRole.role.name);
        for (const rPerm of mRole.role.permissions) {
          permissionSet.add(rPerm.permission.name);
        }
      }
    }

    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    return {
      userId: user.id,
      institutionId: activeMembership?.institutionId,
      membershipId: activeMembership?.id,
      roles,
      permissions: Array.from(permissionSet),
      isSuperAdmin,
    };
  }

  async can(
    userContext: AuthenticatedUserContext,
    requiredPermission: string,
    resourceOwnerId?: string,
    resourceTenantId?: string,
  ): Promise<boolean> {
    if (!userContext || !userContext.userId) {
      return false;
    }

    // Platform Super Admin bypass
    if (userContext.isSuperAdmin) {
      return true;
    }

    // Tenant boundary verification: resource tenant MUST match user active tenant
    if (
      resourceTenantId &&
      userContext.institutionId &&
      resourceTenantId !== userContext.institutionId
    ) {
      this.logger.warn(
        `[AUTHORIZATION] Cross-tenant access denied! User Tenant: ${userContext.institutionId}, Resource Tenant: ${resourceTenantId}`,
      );
      return false;
    }

    // Check permission capability
    const hasPerm = userContext.permissions.includes(requiredPermission);
    if (!hasPerm) {
      if (
        requiredPermission.endsWith('.self') &&
        resourceOwnerId &&
        resourceOwnerId === userContext.userId
      ) {
        return true;
      }
      return false;
    }

    // Ownership self-access enforcement for .self permissions
    if (
      requiredPermission.endsWith('.self') &&
      resourceOwnerId &&
      resourceOwnerId !== userContext.userId
    ) {
      return false;
    }

    return true;
  }
}
