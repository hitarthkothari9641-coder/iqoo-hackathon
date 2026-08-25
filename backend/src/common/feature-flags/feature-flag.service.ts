import { Injectable, Logger } from '@nestjs/common';

export enum FeatureFlagKey {
  ERP_SYNC = 'ERP_SYNC',
  SOCIAL_FEED = 'SOCIAL_FEED',
  COMMUNITIES = 'COMMUNITIES',
  CLUBS = 'CLUBS',
  EVENTS = 'EVENTS',
  PLACEMENTS = 'PLACEMENTS',
  ALUMNI = 'ALUMNI',
  MARKETPLACE = 'MARKETPLACE',
  AI_ASSISTANT = 'AI_ASSISTANT',
  PARENT_PORTAL = 'PARENT_PORTAL',
}

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  // Default flags for initial platform foundation
  private readonly defaultFlags: Record<FeatureFlagKey, boolean> = {
    [FeatureFlagKey.ERP_SYNC]: false,
    [FeatureFlagKey.SOCIAL_FEED]: false,
    [FeatureFlagKey.COMMUNITIES]: false,
    [FeatureFlagKey.CLUBS]: false,
    [FeatureFlagKey.EVENTS]: false,
    [FeatureFlagKey.PLACEMENTS]: false,
    [FeatureFlagKey.ALUMNI]: false,
    [FeatureFlagKey.MARKETPLACE]: false,
    [FeatureFlagKey.AI_ASSISTANT]: false,
    [FeatureFlagKey.PARENT_PORTAL]: false,
  };

  isEnabled(flag: FeatureFlagKey, institutionId?: string): boolean {
    this.logger.debug(`[FEATURE_FLAG] Evaluating ${flag} for tenant: ${institutionId || 'GLOBAL'}`);
    return this.defaultFlags[flag] ?? false;
  }
}
