import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TokenService } from './token.service';
import { SecurityEventService } from '../../common/logging/security-event.service';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSessionOptions {
  userId: string;
  institutionId?: string;
  rawRefreshToken: string;
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly securityEventService: SecurityEventService,
  ) {}

  async createSession(options: CreateSessionOptions) {
    const refreshTokenHash = this.tokenService.hashRefreshToken(
      options.rawRefreshToken,
    );
    const tokenFamilyId = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day refresh token validity

    const session = await this.prisma.session.create({
      data: {
        userId: options.userId,
        institutionId: options.institutionId,
        refreshTokenHash,
        tokenFamilyId,
        deviceId: options.deviceId,
        deviceName: options.deviceName,
        platform: options.platform,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        expiresAt,
      },
    });

    await this.securityEventService.logEvent({
      userId: options.userId,
      institutionId: options.institutionId,
      eventType: 'SESSION_CREATED',
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: { sessionId: session.id, deviceId: options.deviceId },
    });

    return session;
  }

  async getUserSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        platform: true,
        ipAddress: true,
        userAgent: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    return sessions;
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found',
      });
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
        revokeReason: 'USER_REVOKED',
      },
    });

    await this.securityEventService.logEvent({
      userId,
      institutionId: session.institutionId || undefined,
      eventType: 'SESSION_REVOKED',
      metadata: { sessionId },
    });
  }

  async revokeAllSessions(
    userId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        id: exceptSessionId ? { not: exceptSessionId } : undefined,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: 'REVOKE_ALL_REQUESTED',
      },
    });

    await this.securityEventService.logEvent({
      userId,
      eventType: 'ALL_SESSIONS_REVOKED',
      metadata: { exceptSessionId },
    });
  }
}
