import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SecurityEventData {
  userId?: string;
  institutionId?: string;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SecurityEventService {
  private readonly logger = new Logger(SecurityEventService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logEvent(data: SecurityEventData): Promise<void> {
    try {
      this.logger.log(
        `[SECURITY_EVENT] ${data.eventType} | User: ${data.userId || 'ANONYMOUS'} | Tenant: ${data.institutionId || 'GLOBAL'} | IP: ${data.ipAddress || 'UNKNOWN'}`,
      );

      await this.prisma.securityEvent.create({
        data: {
          userId: data.userId,
          institutionId: data.institutionId,
          eventType: data.eventType,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record security event ${data.eventType}:`,
        error,
      );
    }
  }

  async logAudit(
    action: string,
    resourceType: string,
    resourceId?: string,
    actorUserId?: string,
    institutionId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          resourceType,
          resourceId,
          actorUserId,
          institutionId,
          metadata: metadata || {},
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to record audit log ${action}:`, error);
    }
  }
}
