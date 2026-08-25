import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NormalizationService } from '../normalization/normalization.service';
import { CircuitBreakerService } from '../resilience/circuit-breaker.service';
import { MockERPAdapter } from '../adapters/mock-erp.adapter';
import { IntegrationAdapter } from '../adapters/integration-adapter.interface';
import { SyncJobType, SyncJobStatus } from '@prisma/client';

@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizationService: NormalizationService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  private resolveAdapter(_providerId: string): IntegrationAdapter {
    return new MockERPAdapter();
  }

  async executeSync(
    integrationId: string,
    type: SyncJobType = SyncJobType.FULL_SYNC,
    triggeredBy: string = 'SYSTEM',
  ) {
    const integration = await this.prisma.institutionIntegration.findUnique({
      where: { id: integrationId },
      include: { provider: true, institution: true },
    });

    if (!integration) {
      throw new NotFoundException('Institution integration not found');
    }

    if (!this.circuitBreakerService.canExecute(integrationId)) {
      this.logger.warn(
        `[SYNC] Sync blocked by CircuitBreaker for integration ${integrationId}`,
      );
      throw new Error(
        `Integration circuit is OPEN due to previous consecutive failures.`,
      );
    }

    const adapter = this.resolveAdapter(integration.providerId);
    const capabilities = adapter.getCapabilities();

    const syncJob = await this.prisma.syncJob.create({
      data: {
        institutionId: integration.institutionId,
        integrationId: integration.id,
        type,
        status: SyncJobStatus.RUNNING,
        triggeredBy,
        startedAt: new Date(),
      },
    });

    let recordsRead = 0;
    let recordsCreated = 0;
    const recordsUpdated = 0;
    const recordsFailed = 0;

    try {
      // 1. Departments Sync
      if (capabilities.departments) {
        const rawDepts = await adapter.getDepartments();
        recordsRead += rawDepts.length;
        for (const dept of rawDepts) {
          await this.prisma.department.upsert({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: dept.code,
              },
            },
            update: { name: dept.name, externalId: dept.externalId },
            create: {
              institutionId: integration.institutionId,
              code: dept.code,
              name: dept.name,
              externalId: dept.externalId,
            },
          });
          recordsCreated += 1;
        }
      }

      // 2. Programs Sync
      if (capabilities.programs) {
        const rawPrograms = await adapter.getPrograms();
        recordsRead += rawPrograms.length;
        for (const prog of rawPrograms) {
          const dept = await this.prisma.department.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: prog.departmentCode,
              },
            },
          });
          if (dept) {
            await this.prisma.program.upsert({
              where: {
                institutionId_code: {
                  institutionId: integration.institutionId,
                  code: prog.code,
                },
              },
              update: {
                name: prog.name,
                degreeType: prog.degreeType,
                durationYears: prog.durationYears,
              },
              create: {
                institutionId: integration.institutionId,
                departmentId: dept.id,
                code: prog.code,
                name: prog.name,
                degreeType: prog.degreeType,
                durationYears: prog.durationYears,
                externalId: prog.externalId,
              },
            });
            recordsCreated += 1;
          }
        }
      }

      // 3. Courses & Subjects Sync
      if (capabilities.courses) {
        const rawCourses = await adapter.getCourses();
        recordsRead += rawCourses.length;
        for (const course of rawCourses) {
          const prog = await this.prisma.program.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: course.programCode,
              },
            },
          });
          const dept = await this.prisma.department.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: course.departmentCode,
              },
            },
          });
          if (prog && dept) {
            await this.prisma.course.upsert({
              where: {
                institutionId_code: {
                  institutionId: integration.institutionId,
                  code: course.code,
                },
              },
              update: { name: course.name, credits: course.credits },
              create: {
                institutionId: integration.institutionId,
                programId: prog.id,
                departmentId: dept.id,
                code: course.code,
                name: course.name,
                credits: course.credits,
                externalId: course.externalId,
              },
            });
            recordsCreated += 1;
          }
        }
      }

      if (capabilities.subjects) {
        const rawSubjects = await adapter.getSubjects();
        recordsRead += rawSubjects.length;
        for (const subj of rawSubjects) {
          const course = await this.prisma.course.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: subj.courseCode,
              },
            },
          });
          if (course) {
            await this.prisma.subject.upsert({
              where: {
                institutionId_code: {
                  institutionId: integration.institutionId,
                  code: subj.code,
                },
              },
              update: {
                name: subj.name,
                type: this.normalizationService.normalizeSubjectType(subj.type),
                credits: subj.credits,
              },
              create: {
                institutionId: integration.institutionId,
                courseId: course.id,
                code: subj.code,
                name: subj.name,
                type: this.normalizationService.normalizeSubjectType(subj.type),
                credits: subj.credits,
                externalId: subj.externalId,
              },
            });
            recordsCreated += 1;
          }
        }
      }

      // 4. Academic Years & Semesters & Sections Sync
      const year = await this.prisma.academicYear.upsert({
        where: {
          institutionId_name: {
            institutionId: integration.institutionId,
            name: '2026-2027',
          },
        },
        update: {},
        create: {
          institutionId: integration.institutionId,
          name: '2026-2027',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2027-05-31'),
          isCurrent: true,
        },
      });

      const sem = await this.prisma.semester.upsert({
        where: {
          institutionId_academicYearId_semesterNumber: {
            institutionId: integration.institutionId,
            academicYearId: year.id,
            semesterNumber: 3,
          },
        },
        update: {},
        create: {
          institutionId: integration.institutionId,
          academicYearId: year.id,
          name: 'Semester 3',
          semesterNumber: 3,
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-12-20'),
        },
      });

      if (capabilities.sections) {
        const rawSections = await adapter.getSections();
        recordsRead += rawSections.length;
        for (const sec of rawSections) {
          const prog = await this.prisma.program.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: sec.programCode,
              },
            },
          });
          if (prog) {
            await this.prisma.section.upsert({
              where: {
                institutionId_programId_semesterId_name: {
                  institutionId: integration.institutionId,
                  programId: prog.id,
                  semesterId: sem.id,
                  name: sec.name,
                },
              },
              update: {},
              create: {
                institutionId: integration.institutionId,
                programId: prog.id,
                academicYearId: year.id,
                semesterId: sem.id,
                name: sec.name,
                externalId: sec.externalId,
              },
            });
            recordsCreated += 1;
          }
        }
      }

      // 5. Students Sync
      if (capabilities.students) {
        const studentResult = await adapter.getStudents();
        recordsRead += studentResult.data.length;
        for (const rawStu of studentResult.data) {
          const user = await this.prisma.user.findUnique({
            where: { email: rawStu.email },
          });
          if (user) {
            await this.prisma.studentProfile.upsert({
              where: {
                institutionId_studentId: {
                  institutionId: integration.institutionId,
                  studentId: rawStu.studentId,
                },
              },
              update: {
                currentSemester: rawStu.currentSemester,
                externalId: rawStu.externalId,
              },
              create: {
                userId: user.id,
                institutionId: integration.institutionId,
                studentId: rawStu.studentId,
                admissionYear: rawStu.admissionYear || 2024,
                currentSemester: rawStu.currentSemester || 3,
                externalId: rawStu.externalId,
              },
            });

            await this.prisma.externalIdentity.upsert({
              where: {
                institutionId_sourceSystem_externalId: {
                  institutionId: integration.institutionId,
                  sourceSystem: integration.provider.vendor,
                  externalId: rawStu.externalId,
                },
              },
              update: {},
              create: {
                userId: user.id,
                institutionId: integration.institutionId,
                providerId: integration.providerId,
                sourceSystem: integration.provider.vendor,
                externalId: rawStu.externalId,
                externalType: 'STUDENT',
              },
            });

            recordsCreated += 1;
          }
        }
      }

      // 6. Timetable Sync
      if (capabilities.timetable) {
        const rawTimetables = await adapter.getTimetable();
        recordsRead += rawTimetables.length;
        for (const tt of rawTimetables) {
          const subj = await this.prisma.subject.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: tt.subjectCode,
              },
            },
          });
          const sec = await this.prisma.section.findFirst({
            where: {
              institutionId: integration.institutionId,
              name: tt.sectionName,
            },
          });
          if (subj && sec) {
            await this.prisma.timetableEntry.create({
              data: {
                institutionId: integration.institutionId,
                sectionId: sec.id,
                subjectId: subj.id,
                dayOfWeek: tt.dayOfWeek,
                startTime: tt.startTime,
                endTime: tt.endTime,
                room: tt.room,
                building: tt.building,
                externalId: tt.externalId,
              },
            });
            recordsCreated += 1;
          }
        }
      }

      // 7. Attendance Sync
      if (capabilities.attendance) {
        const rawAttendance = await adapter.getAttendance();
        recordsRead += rawAttendance.length;
        for (const att of rawAttendance) {
          const studentProfile = await this.prisma.studentProfile.findFirst({
            where: {
              institutionId: integration.institutionId,
              externalId: att.studentExternalId,
            },
          });
          const subj = await this.prisma.subject.findUnique({
            where: {
              institutionId_code: {
                institutionId: integration.institutionId,
                code: att.subjectCode,
              },
            },
          });

          if (studentProfile && subj) {
            const status = this.normalizationService.normalizeAttendanceStatus(
              att.status,
            );
            const attDate = this.normalizationService.parseDate(att.date);

            await this.prisma.attendanceRecord.upsert({
              where: {
                institutionId_studentProfileId_subjectId_date_period: {
                  institutionId: integration.institutionId,
                  studentProfileId: studentProfile.id,
                  subjectId: subj.id,
                  date: attDate,
                  period: att.period,
                },
              },
              update: { status, lastSyncedAt: new Date() },
              create: {
                institutionId: integration.institutionId,
                studentProfileId: studentProfile.id,
                subjectId: subj.id,
                date: attDate,
                period: att.period,
                status,
                externalId: att.externalId,
                source: 'ERP',
              },
            });
            recordsCreated += 1;
          }
        }
      }

      // 8. Exams & Results Sync
      if (capabilities.exams) {
        const rawExams = await adapter.getExams();
        recordsRead += rawExams.length;
        for (const ex of rawExams) {
          const exam = await this.prisma.exam.create({
            data: {
              institutionId: integration.institutionId,
              name: ex.name,
              type: this.normalizationService.normalizeExamType(ex.type),
              startDate: new Date(ex.startDate),
              endDate: new Date(ex.endDate),
              externalId: ex.externalId,
            },
          });

          if (capabilities.results) {
            const rawResults = await adapter.getResults(ex.externalId);
            recordsRead += rawResults.length;
            for (const res of rawResults) {
              const studentProfile = await this.prisma.studentProfile.findFirst(
                {
                  where: {
                    institutionId: integration.institutionId,
                    externalId: res.studentExternalId,
                  },
                },
              );
              const subj = await this.prisma.subject.findUnique({
                where: {
                  institutionId_code: {
                    institutionId: integration.institutionId,
                    code: res.subjectCode,
                  },
                },
              });

              if (studentProfile && subj) {
                await this.prisma.result.upsert({
                  where: {
                    studentProfileId_examId_subjectId: {
                      studentProfileId: studentProfile.id,
                      examId: exam.id,
                      subjectId: subj.id,
                    },
                  },
                  update: {
                    marks: res.marks,
                    grade: res.grade,
                    gradePoint: res.gradePoint,
                  },
                  create: {
                    institutionId: integration.institutionId,
                    studentProfileId: studentProfile.id,
                    examId: exam.id,
                    subjectId: subj.id,
                    marks: res.marks,
                    maxMarks: res.maxMarks,
                    grade: res.grade,
                    gradePoint: res.gradePoint,
                    externalId: res.externalId,
                  },
                });
                recordsCreated += 1;
              }
            }
          }
        }
      }

      await this.prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: SyncJobStatus.COMPLETED,
          completedAt: new Date(),
          recordsRead,
          recordsCreated,
          recordsUpdated,
          recordsFailed,
        },
      });

      await this.prisma.institutionIntegration.update({
        where: { id: integrationId },
        data: {
          status: 'CONNECTED',
          lastSuccessfulSyncAt: new Date(),
          lastAttemptedSyncAt: new Date(),
        },
      });

      this.circuitBreakerService.recordSuccess(integrationId);

      return {
        jobId: syncJob.id,
        status: SyncJobStatus.COMPLETED,
        recordsProcessed: recordsCreated + recordsUpdated,
      };
    } catch (error: any) {
      this.logger.error(`[SYNC] Sync job ${syncJob.id} failed:`, error);
      this.circuitBreakerService.recordFailure(integrationId);

      await this.prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: SyncJobStatus.FAILED,
          completedAt: new Date(),
          recordsRead,
          recordsFailed: recordsRead - recordsCreated,
        },
      });

      await this.prisma.institutionIntegration.update({
        where: { id: integrationId },
        data: {
          status: 'ERROR',
          lastAttemptedSyncAt: new Date(),
        },
      });

      throw error;
    }
  }
}
