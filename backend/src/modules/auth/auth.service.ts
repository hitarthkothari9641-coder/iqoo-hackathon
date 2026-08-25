import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { TokenService, IssuedTokens } from './token.service';
import { SessionService } from './session.service';
import { SecurityEventService } from '../../common/logging/security-event.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import {
  UserStatus,
  MembershipStatus,
  InstitutionStatus,
} from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly securityEventService: SecurityEventService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ tokens: IssuedTokens; user: any }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberships: {
          include: { institution: true },
        },
      },
    });

    if (!user) {
      this.logger.warn(
        `[AUTH] Failed login attempt for non-existent email: ${dto.email}`,
      );
      await this.securityEventService.logEvent({
        eventType: 'LOGIN_FAILED',
        ipAddress,
        userAgent,
        metadata: { reason: 'ACCOUNT_NOT_FOUND', email: dto.email },
      });
      // Security Directive: Generic authentication error to prevent account enumeration
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Check Account Status
    if (
      user.status === UserStatus.LOCKED ||
      (user.lockExpiresAt && user.lockExpiresAt > new Date())
    ) {
      await this.securityEventService.logEvent({
        userId: user.id,
        eventType: 'LOGIN_BLOCKED_LOCKED',
        ipAddress,
        userAgent,
      });
      throw new ForbiddenException({
        code: 'AUTH_ACCOUNT_LOCKED',
        message:
          'Account is temporarily locked due to security policy. Please contact support.',
      });
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: 'AUTH_ACCOUNT_SUSPENDED',
        message: 'Account has been suspended.',
      });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.securityEventService.logEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILED',
        ipAddress,
        userAgent,
        metadata: { reason: 'INVALID_PASSWORD' },
      });

      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Resolve Active Tenant Membership
    let activeMembership = user.memberships.find(
      (m) =>
        dto.institutionSlug &&
        m.institution.slug === dto.institutionSlug &&
        m.status === MembershipStatus.ACTIVE,
    );

    if (!activeMembership) {
      activeMembership = user.memberships.find(
        (m) => m.status === MembershipStatus.ACTIVE,
      );
    }

    if (
      activeMembership &&
      activeMembership.institution.status === InstitutionStatus.SUSPENDED
    ) {
      throw new ForbiddenException({
        code: 'TENANT_SUSPENDED',
        message: 'The selected college institution is currently suspended.',
      });
    }

    // Generate Session & Tokens
    const rawRefreshToken = this.tokenService.generateRefreshToken();

    const session = await this.sessionService.createSession({
      userId: user.id,
      institutionId: activeMembership?.institutionId,
      rawRefreshToken,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      platform: dto.platform,
      ipAddress,
      userAgent,
    });

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      sessionId: session.id,
      tokenFamilyId: session.tokenFamilyId,
      institutionId: activeMembership?.institutionId,
    });

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.securityEventService.logEvent({
      userId: user.id,
      institutionId: activeMembership?.institutionId,
      eventType: 'LOGIN_SUCCESS',
      ipAddress,
      userAgent,
      metadata: { sessionId: session.id },
    });

    return {
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
        expiresIn: 900,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl,
        activeInstitutionId: activeMembership?.institutionId,
      },
    };
  }

  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: any; requiresVerification: boolean }> {
    const emailLower = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new BadRequestException({
        code: 'AUTH_EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
      });
    }

    // Resolve Target Institution if provided
    let institution = null;
    if (dto.institutionSlug) {
      institution = await this.prisma.institution.findUnique({
        where: { slug: dto.institutionSlug },
      });
      if (!institution) {
        throw new NotFoundException({
          code: 'TENANT_NOT_FOUND',
          message: 'Requested institution does not exist',
        });
      }

      // Check Registration Mode Policy
      const settings = (institution.settings as any) || {};
      const regMode = settings.registrationMode || 'OPEN';

      if (regMode === 'ADMIN_ONLY' || regMode === 'INVITE_ONLY') {
        throw new ForbiddenException({
          code: 'REGISTRATION_RESTRICTED',
          message: `Registration for ${institution.name} is restricted to institutional invites.`,
        });
      }

      if (regMode === 'COLLEGE_EMAIL' && institution.primaryDomain) {
        if (!emailLower.endsWith(`@${institution.primaryDomain}`)) {
          throw new BadRequestException({
            code: 'COLLEGE_EMAIL_REQUIRED',
            message: `Registration requires an official email ending with @${institution.primaryDomain}`,
          });
        }
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: emailLower,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: `${dto.firstName} ${dto.lastName}`.trim(),
          phone: dto.phone,
          status: UserStatus.PENDING,
        },
      });

      if (institution) {
        await tx.institutionMembership.create({
          data: {
            userId: newUser.id,
            institutionId: institution.id,
            status: MembershipStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
      }

      return newUser;
    });

    await this.securityEventService.logEvent({
      userId: user.id,
      institutionId: institution?.id,
      eventType: 'USER_REGISTERED',
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      requiresVerification: true,
    };
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.sessionService.revokeSession(sessionId, userId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllSessions(userId);
  }

  async refreshToken(
    rawRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ tokens: IssuedTokens }> {
    const result = await this.tokenService.rotateRefreshToken(
      rawRefreshToken,
      ipAddress,
      userAgent,
    );
    return { tokens: result.tokens };
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour expiry

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.securityEventService.logEvent({
        userId: user.id,
        eventType: 'PASSWORD_RESET_REQUESTED',
        ipAddress,
        userAgent,
      });
    }

    // Security Directive: Generic success response to avoid email enumeration
    return {
      message:
        'If an account matches the email provided, password reset instructions have been dispatched.',
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Password reset token is invalid or has expired',
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      // Update password hash
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      // Revoke all existing sessions for security
      await tx.session.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'PASSWORD_RESET' },
      });
    });

    await this.securityEventService.logEvent({
      userId: resetToken.userId,
      eventType: 'PASSWORD_RESET_SUCCESSFUL',
      ipAddress,
      userAgent,
    });

    return {
      message:
        'Password has been reset successfully. Please log in with your new credentials.',
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    sessionId?: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke other sessions
    await this.sessionService.revokeAllSessions(userId, sessionId);

    await this.securityEventService.logEvent({
      userId,
      eventType: 'PASSWORD_CHANGED',
    });

    return { message: 'Password changed successfully.' };
  }
}
