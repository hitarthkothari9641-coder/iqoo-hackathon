import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedRequest,
} from '../../common/guards/auth.guard';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('student-academics')
@Controller('academics')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class StudentAcademicsController {
  constructor(private readonly prisma: PrismaService) {}

  private async getStudentProfile(req: AuthenticatedRequest) {
    const studentProfile = await this.prisma.studentProfile.findFirst({
      where: {
        userId: req.user.userId,
        institutionId: req.user.institutionId,
      },
      include: { section: true, program: true, department: true },
    });

    if (!studentProfile) {
      throw new NotFoundException({
        code: 'STUDENT_PROFILE_NOT_FOUND',
        message:
          'No student academic profile found in the active institution context.',
      });
    }

    return studentProfile;
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Get unified student academic dashboard summary' })
  async getDashboardSummary(@Req() req: AuthenticatedRequest) {
    const student = await this.getStudentProfile(req);

    let nextClass = null;
    if (student.sectionId) {
      nextClass = await this.prisma.timetableEntry.findFirst({
        where: { sectionId: student.sectionId },
        include: { subject: { select: { code: true, name: true } } },
        orderBy: { startTime: 'asc' },
      });
    }

    const nextExam = await this.prisma.examSchedule.findFirst({
      where: { subject: { institutionId: req.user.institutionId } },
      include: { subject: { select: { code: true, name: true } } },
      orderBy: { date: 'asc' },
    });

    const pendingAssignmentsCount = await this.prisma.assignment.count({
      where: {
        institutionId: req.user.institutionId,
        status: 'PUBLISHED',
        dueAt: { gte: new Date() },
      },
    });

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: { studentProfileId: student.id },
    });

    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'EXCUSED',
    ).length;
    const overallPercentage =
      totalClasses > 0
        ? Math.round((attendedClasses / totalClasses) * 10000) / 100
        : 0;

    return {
      currentSemester: student.currentSemester,
      academicYear: '2026-2027',
      todayOverview: {
        nextClass: nextClass
          ? `${nextClass.subject.name} (${nextClass.startTime})`
          : 'No upcoming classes today',
        nextExam: nextExam
          ? `${nextExam.subject.name} on ${nextExam.date.toISOString().split('T')[0]}`
          : 'No upcoming exams',
        pendingAssignmentsCount,
        attendancePercentage: overallPercentage,
        attendanceWarning: overallPercentage < 75,
      },
      quickStats: {
        creditsCompleted: 94,
        degreeTargetCredits: 160,
      },
    };
  }

  @Get('me/timetable')
  @ApiOperation({ summary: 'Get current student timetable' })
  async getTimetable(@Req() req: AuthenticatedRequest) {
    const student = await this.getStudentProfile(req);

    if (!student.sectionId) {
      return { timetable: [], section: null };
    }

    const timetable = await this.prisma.timetableEntry.findMany({
      where: { sectionId: student.sectionId },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            credits: true,
          },
        },
        facultyProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, displayName: true },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return {
      section: student.section?.name,
      timetable,
    };
  }

  @Get('me/subjects')
  @ApiOperation({ summary: 'Get enrolled subjects' })
  async getSubjects(@Req() req: AuthenticatedRequest) {
    await this.getStudentProfile(req);

    const subjects = await this.prisma.subject.findMany({
      where: { institutionId: req.user.institutionId },
      select: { id: true, code: true, name: true, type: true, credits: true },
    });

    return { subjects };
  }

  @Get('me/attendance')
  @ApiOperation({
    summary: 'Get student attendance records and percentage summary',
  })
  async getAttendance(@Req() req: AuthenticatedRequest) {
    const student = await this.getStudentProfile(req);

    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentProfileId: student.id },
      include: {
        subject: { select: { id: true, code: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const subjectStatsMap = new Map<
      string,
      { subject: any; total: number; present: number }
    >();

    for (const rec of records) {
      const sId = rec.subjectId;
      if (!subjectStatsMap.has(sId)) {
        subjectStatsMap.set(sId, {
          subject: rec.subject,
          total: 0,
          present: 0,
        });
      }
      const stat = subjectStatsMap.get(sId)!;
      stat.total += 1;
      if (rec.status === 'PRESENT' || rec.status === 'EXCUSED') {
        stat.present += 1;
      }
    }

    const summary = Array.from(subjectStatsMap.values()).map((s) => ({
      subject: s.subject,
      totalClasses: s.total,
      attendedClasses: s.present,
      percentage:
        s.total > 0 ? Math.round((s.present / s.total) * 10000) / 100 : 0,
    }));

    return { summary, records };
  }

  @Get('me/exams')
  @ApiOperation({ summary: 'Get upcoming & completed exam schedules' })
  async getExams(@Req() req: AuthenticatedRequest) {
    await this.getStudentProfile(req);

    const exams = await this.prisma.exam.findMany({
      where: { institutionId: req.user.institutionId },
      include: {
        schedules: {
          include: {
            subject: { select: { code: true, name: true } },
          },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return { exams };
  }

  @Get('me/results')
  @ApiOperation({ summary: 'Get published exam results' })
  async getResults(@Req() req: AuthenticatedRequest) {
    const student = await this.getStudentProfile(req);

    const results = await this.prisma.result.findMany({
      where: { studentProfileId: student.id, status: 'PUBLISHED' },
      include: {
        exam: { select: { id: true, name: true, type: true } },
        subject: {
          select: { id: true, code: true, name: true, credits: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { results };
  }

  @Get('search')
  @ApiOperation({ summary: 'Unified academic search' })
  async searchAcademics(
    @Req() req: AuthenticatedRequest,
    @Query('q') queryStr: string,
  ) {
    if (!req.user.institutionId)
      throw new ForbiddenException('Active tenant context required');
    if (!queryStr || queryStr.trim().length === 0)
      return { subjects: [], assignments: [], resources: [] };

    const q = queryStr.trim();

    const subjects = await this.prisma.subject.findMany({
      where: {
        institutionId: req.user.institutionId,
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, code: true, name: true },
    });

    const assignments = await this.prisma.assignment.findMany({
      where: {
        institutionId: req.user.institutionId,
        status: 'PUBLISHED',
        title: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, title: true, dueAt: true },
    });

    const resources = await this.prisma.courseResource.findMany({
      where: {
        institutionId: req.user.institutionId,
        title: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, title: true, type: true, url: true, fileUrl: true },
    });

    return { subjects, assignments, resources };
  }
}
