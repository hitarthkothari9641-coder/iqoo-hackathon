import { Module } from '@nestjs/common';
import { StudentAcademicsController } from './student-academics.controller';
import { StudyPlannerController } from './study-planner.controller';
import { NotesController } from './notes.controller';
import { ResourcesController } from './resources.controller';
import { CalendarController } from './calendar.controller';
import { AnnouncementsController } from './announcements.controller';
import { AnalyticsController } from './analytics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    StudentAcademicsController,
    StudyPlannerController,
    NotesController,
    ResourcesController,
    CalendarController,
    AnnouncementsController,
    AnalyticsController,
  ],
})
export class AcademicsModule {}
