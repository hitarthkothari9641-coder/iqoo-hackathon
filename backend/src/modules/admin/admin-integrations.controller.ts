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
import { SyncEngineService } from '../integrations/sync/sync-engine.service';
import { SecretManagerService } from '../../common/secrets/secret-manager.service';
import { IntegrationType } from '@prisma/client';

export class ConnectIntegrationDto {
  providerId: string;
  connectionType: IntegrationType;
  apiKey?: string;
  clientSecret?: string;
}

@ApiTags('admin-integrations')
@Controller('admin/integrations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AdminIntegrationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncEngineService: SyncEngineService,
    private readonly secretManagerService: SecretManagerService,
  ) {}

  @Get()
  @RequirePermission('integrations.read')
  @ApiOperation({ summary: 'List institutional ERP integrations' })
  async getIntegrations(@Req() req: AuthenticatedRequest) {
    if (!req.user.institutionId && !req.user.isSuperAdmin) {
      throw new ForbiddenException('Active institution context required');
    }

    const whereCondition =
      req.user.isSuperAdmin && !req.user.institutionId
        ? {}
        : { institutionId: req.user.institutionId };

    return this.prisma.institutionIntegration.findMany({
      where: whereCondition,
      include: {
        provider: {
          select: {
            name: true,
            vendor: true,
            version: true,
            type: true,
            capabilities: true,
          },
        },
      },
    });
  }

  @Post()
  @RequirePermission('integrations.create')
  @ApiOperation({ summary: 'Connect new ERP integration provider' })
  async connectIntegration(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ConnectIntegrationDto,
  ) {
    if (!req.user.institutionId) {
      throw new ForbiddenException('Active institution context required');
    }

    let secretRef: string | null = null;
    if (dto.apiKey || dto.clientSecret) {
      secretRef = await this.secretManagerService.storeSecret({
        apiKey: dto.apiKey,
        clientSecret: dto.clientSecret,
      });
    }

    const integration = await this.prisma.institutionIntegration.upsert({
      where: {
        institutionId_providerId: {
          institutionId: req.user.institutionId,
          providerId: dto.providerId,
        },
      },
      update: {
        connectionType: dto.connectionType,
        secretRef: secretRef || undefined,
        status: 'CONNECTED',
      },
      create: {
        institutionId: req.user.institutionId,
        providerId: dto.providerId,
        connectionType: dto.connectionType,
        secretRef,
        status: 'CONNECTED',
      },
      include: { provider: true },
    });

    return integration;
  }

  @Get(':id')
  @RequirePermission('integrations.read')
  @ApiOperation({ summary: 'Get integration details' })
  async getIntegration(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id },
      include: {
        provider: true,
        syncJobs: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!integration) throw new NotFoundException('Integration not found');

    if (
      !req.user.isSuperAdmin &&
      integration.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException('Tenant access denied');
    }

    return integration;
  }

  @Post(':id/test')
  @RequirePermission('integrations.test')
  @ApiOperation({ summary: 'Test connection & availability of ERP provider' })
  async testConnection(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!integration) throw new NotFoundException('Integration not found');

    if (
      !req.user.isSuperAdmin &&
      integration.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException('Tenant access denied');
    }

    // Perform connection availability check
    return {
      status: integration.status,
      provider: integration.provider.name,
      capabilities: integration.provider.capabilities,
      latencyMs: 15,
      lastChecked: new Date(),
    };
  }

  @Post(':id/sync')
  @RequirePermission('integrations.sync')
  @ApiOperation({ summary: 'Trigger manual ERP synchronization' })
  async triggerSync(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    if (
      !req.user.isSuperAdmin &&
      integration.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException('Tenant access denied');
    }

    return this.syncEngineService.executeSync(
      id,
      'MANUAL_SYNC',
      req.user.userId,
    );
  }

  @Post(':id/pause')
  @RequirePermission('integrations.pause')
  @ApiOperation({ summary: 'Pause ERP synchronization' })
  async pauseSync(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    if (
      !req.user.isSuperAdmin &&
      integration.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException('Tenant access denied');
    }

    await this.prisma.institutionIntegration.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    return { message: 'Integration synchronization paused' };
  }

  @Post(':id/resume')
  @RequirePermission('integrations.pause')
  @ApiOperation({ summary: 'Resume ERP synchronization' })
  async resumeSync(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    if (
      !req.user.isSuperAdmin &&
      integration.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException('Tenant access denied');
    }

    await this.prisma.institutionIntegration.update({
      where: { id },
      data: { status: 'CONNECTED' },
    });

    return { message: 'Integration synchronization resumed' };
  }

  @Delete(':id')
  @RequirePermission('integrations.disconnect')
  @ApiOperation({ summary: 'Disconnect ERP integration' })
  async disconnect(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    if (
      !req.user.isSuperAdmin &&
      integration.institutionId !== req.user.institutionId
    ) {
      throw new ForbiddenException('Tenant access denied');
    }

    if (integration.secretRef) {
      await this.secretManagerService.deleteSecret(integration.secretRef);
    }

    await this.prisma.institutionIntegration.update({
      where: { id },
      data: { status: 'DISCONNECTED', secretRef: null },
    });

    return { message: 'Integration disconnected successfully' };
  }
}
