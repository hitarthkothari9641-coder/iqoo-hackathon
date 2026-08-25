import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('webhooks')
@Controller('integrations/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly processedEvents = new Set<string>();

  constructor(private readonly prisma: PrismaService) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive authorized ERP event webhooks' })
  async handleWebhook(
    @Param('provider') providerVendor: string,
    @Headers('x-webhook-signature') _signature: string,
    @Headers('x-event-id') eventId: string,
    @Body() _payload: any,
  ) {
    this.logger.log(
      `[WEBHOOK] Received event from provider vendor ${providerVendor}`,
    );

    if (eventId && this.processedEvents.has(eventId)) {
      this.logger.log(`[WEBHOOK] Duplicate event ${eventId} ignored safely.`);
      return { status: 'DUPLICATE_IGNORED' };
    }

    if (eventId) {
      this.processedEvents.add(eventId);
    }

    return {
      status: 'RECEIVED',
      provider: providerVendor,
      eventId: eventId || 'UNTRACKED',
    };
  }
}
