import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { SecurityEventService } from '../../common/logging/security-event.service';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  sessionId: string;
  tokenFamilyId: string;
  institutionId?: string;
  iat?: number;
  exp?: number;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly securityEventService: SecurityEventService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.security.jwtAccessSecret,
      expiresIn: '15m',
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.security.jwtAccessSecret,
      });
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_EXPIRED',
        message: 'Access token is invalid or has expired',
      });
    }
  }

  async rotateRefreshToken(
    rawRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ tokens: IssuedTokens; userId: string; institutionId?: string }> {
    const tokenHash = this.hashRefreshToken(rawRefreshToken);

    const session = await this.prisma.session.findFirst({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      this.logger.warn(
        `[TOKEN] Attempted refresh with unknown or revoked token hash`,
      );
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_EXPIRED',
        message: 'Invalid or revoked refresh token',
      });
    }

    // Reuse Detection Attack Prevention: If session is already revoked, revoke whole token family!
    if (session.revokedAt) {
      this.logger.error(
        `[SECURITY] REFRESH TOKEN REUSE DETECTED! Family: ${session.tokenFamilyId}, User: ${session.userId}`,
      );

      // Revoke all sessions belonging to this token family
      await this.prisma.session.updateMany({
        where: { tokenFamilyId: session.tokenFamilyId },
        data: {
          revokedAt: new Date(),
          revokeReason: 'REFRESH_TOKEN_REUSE_DETECTED',
        },
      });

      await this.securityEventService.logEvent({
        userId: session.userId,
        institutionId: session.institutionId || undefined,
        eventType: 'REFRESH_TOKEN_REUSE',
        ipAddress,
        userAgent,
        metadata: {
          tokenFamilyId: session.tokenFamilyId,
          sessionId: session.id,
        },
      });

      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_REUSE_DETECTED',
        message:
          'Security alert: Refresh token reuse detected. Session family invalidated.',
      });
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_EXPIRED',
        message: 'Refresh token has expired',
      });
    }

    // Generate new refresh token and rotate
    const newRawRefreshToken = this.generateRefreshToken();
    const newRefreshTokenHash = this.hashRefreshToken(newRawRefreshToken);

    // Atomic transaction for token rotation
    await this.prisma.$transaction(async (tx) => {
      // Mark old session/token as revoked
      await tx.session.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
          revokeReason: 'ROTATED',
        },
      });

      // Create new session in the same token family
      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

      await tx.session.create({
        data: {
          userId: session.userId,
          institutionId: session.institutionId,
          refreshTokenHash: newRefreshTokenHash,
          tokenFamilyId: session.tokenFamilyId,
          deviceId: session.deviceId,
          deviceName: session.deviceName,
          platform: session.platform,
          ipAddress,
          userAgent,
          expiresAt: refreshExpiresAt,
        },
      });
    });

    const accessToken = this.generateAccessToken({
      sub: session.userId,
      sessionId: session.id,
      tokenFamilyId: session.tokenFamilyId,
      institutionId: session.institutionId || undefined,
    });

    return {
      tokens: {
        accessToken,
        refreshToken: newRawRefreshToken,
        expiresIn: 900, // 15 minutes in seconds
      },
      userId: session.userId,
      institutionId: session.institutionId || undefined,
    };
  }
}
