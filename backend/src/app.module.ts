import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';

// Common Providers
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { EventBusService } from './common/events/event-bus.service';
import { StorageService } from './common/storage/storage.service';
import { FeatureFlagService } from './common/feature-flags/feature-flag.service';
import { AuthorizationService } from './common/guards/authorization.service';

// Core Domain Modules Foundation
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { SocialModule } from './modules/social/social.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { EventsModule } from './modules/events/events.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { CareerModule } from './modules/career/career.module';
import { PlacementsModule } from './modules/placements/placements.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    HealthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Domain Modules Foundation
    AuthModule,
    UsersModule,
    InstitutionsModule,
    AcademicsModule,
    AttendanceModule,
    AssignmentsModule,
    SocialModule,
    CommunitiesModule,
    ClubsModule,
    EventsModule,
    MessagingModule,
    CareerModule,
    PlacementsModule,
    AlumniModule,
    NotificationsModule,
    IntegrationsModule,
    AiModule,
    AdminModule,
  ],
  providers: [
    EventBusService,
    StorageService,
    FeatureFlagService,
    AuthorizationService,
  ],
  exports: [
    EventBusService,
    StorageService,
    FeatureFlagService,
    AuthorizationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, TenantMiddleware).forRoutes('*');
  }
}
