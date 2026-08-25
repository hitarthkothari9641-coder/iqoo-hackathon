import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import {
  IntegrationAdapter,
  AdapterCapabilities,
  RawStudentRecord,
  RawFacultyRecord,
  RawDepartmentRecord,
  RawProgramRecord,
  RawCourseRecord,
  RawSubjectRecord,
  RawSectionRecord,
  RawTimetableRecord,
  RawAttendanceRecord,
  RawExamRecord,
  RawExamScheduleRecord,
  RawResultRecord,
} from './integration-adapter.interface';

@Injectable()
export class MockERPAdapter implements IntegrationAdapter {
  private readonly logger = new Logger(MockERPAdapter.name);
  readonly providerId = '00000000-0000-0000-0000-000000000010';

  constructor() {
    const env = process.env.APP_ENV || 'development';
    const mockEnabled = process.env.MOCK_ERP_ENABLED === 'true';

    if (env === 'production' && mockEnabled) {
      this.logger.error(
        '[SECURITY_CRITICAL] MockERPAdapter IS STRICTLY FORBIDDEN IN PRODUCTION!',
      );
      throw new ForbiddenException({
        code: 'MOCK_ERP_FORBIDDEN_IN_PRODUCTION',
        message:
          'MockERPAdapter cannot be instantiated in production environment.',
      });
    }
  }

  getCapabilities(): AdapterCapabilities {
    return {
      students: true,
      faculty: true,
      departments: true,
      programs: true,
      courses: true,
      subjects: true,
      sections: true,
      academicPeriods: true,
      timetable: true,
      attendance: true,
      exams: true,
      results: true,
    };
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number }> {
    const start = Date.now();
    await new Promise((res) => setTimeout(res, 20));
    return { success: true, latencyMs: Date.now() - start };
  }

  async getDepartments(): Promise<RawDepartmentRecord[]> {
    return [
      {
        externalId: 'DEPT-CSE',
        code: 'CSE',
        name: 'Computer Science & Engineering',
      },
      {
        externalId: 'DEPT-ECE',
        code: 'ECE',
        name: 'Electronics & Communication',
      },
    ];
  }

  async getPrograms(): Promise<RawProgramRecord[]> {
    return [
      {
        externalId: 'PROG-BTECH-CSE',
        code: 'BTECH-CSE',
        name: 'Bachelor of Technology in Computer Science',
        departmentCode: 'CSE',
        degreeType: 'B.Tech',
        durationYears: 4,
      },
    ];
  }

  async getCourses(): Promise<RawCourseRecord[]> {
    return [
      {
        externalId: 'COURSE-CSE-MAIN',
        code: 'CSE-CORE',
        name: 'Computer Science Core Curriculum',
        programCode: 'BTECH-CSE',
        departmentCode: 'CSE',
        credits: 160,
      },
    ];
  }

  async getSubjects(): Promise<RawSubjectRecord[]> {
    return [
      {
        externalId: 'SUB-CS301',
        code: 'CS301',
        name: 'Data Structures & Algorithms',
        courseCode: 'CSE-CORE',
        type: 'CORE',
        credits: 4,
        semesterNumber: 3,
      },
      {
        externalId: 'SUB-CS302',
        code: 'CS302',
        name: 'Database Management Systems',
        courseCode: 'CSE-CORE',
        type: 'CORE',
        credits: 4,
        semesterNumber: 3,
      },
    ];
  }

  async getSections(): Promise<RawSectionRecord[]> {
    return [
      {
        externalId: 'SEC-CSE-3A',
        name: 'Section 3A',
        programCode: 'BTECH-CSE',
        academicYearName: '2026-2027',
        semesterNumber: 3,
      },
    ];
  }

  async getStudents(
    _cursor?: string,
  ): Promise<{ data: RawStudentRecord[]; nextCursor?: string }> {
    return {
      data: [
        {
          externalId: 'ERP-STU-001',
          studentId: 'USN-2026-CSE-001',
          email: 'student@demo.collegeos.edu',
          firstName: 'Aarav',
          lastName: 'Sharma',
          departmentCode: 'CSE',
          programCode: 'BTECH-CSE',
          sectionName: 'Section 3A',
          currentSemester: 3,
          admissionYear: 2024,
        },
      ],
    };
  }

  async getFaculty(
    _cursor?: string,
  ): Promise<{ data: RawFacultyRecord[]; nextCursor?: string }> {
    return {
      data: [
        {
          externalId: 'ERP-FAC-001',
          employeeId: 'EMP-1001',
          email: 'admin@demo.collegeos.edu',
          firstName: 'Dr. Rajesh',
          lastName: 'Kumar',
          departmentCode: 'CSE',
          designation: 'Professor & HOD',
        },
      ],
    };
  }

  async getTimetable(_sectionName?: string): Promise<RawTimetableRecord[]> {
    return [
      {
        externalId: 'TT-CS301-MON',
        sectionName: 'Section 3A',
        programCode: 'BTECH-CSE',
        subjectCode: 'CS301',
        facultyEmployeeId: 'EMP-1001',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        room: 'Lab 2',
        building: 'Tech Block A',
      },
    ];
  }

  async getAttendance(
    _startDate?: string,
    _endDate?: string,
  ): Promise<RawAttendanceRecord[]> {
    return [
      {
        externalId: 'ATT-2026-08-25-01',
        studentExternalId: 'ERP-STU-001',
        subjectCode: 'CS301',
        date: '2026-08-25',
        period: 1,
        status: 'PRESENT',
      },
    ];
  }

  async getExams(): Promise<RawExamRecord[]> {
    return [
      {
        externalId: 'EXAM-MIDTERM-1',
        name: 'Semester 3 Midterm Examinations',
        type: 'MIDTERM',
        startDate: '2026-09-15',
        endDate: '2026-09-22',
      },
    ];
  }

  async getExamSchedules(_examId?: string): Promise<RawExamScheduleRecord[]> {
    return [
      {
        externalId: 'SCHED-CS301',
        examExternalId: 'EXAM-MIDTERM-1',
        subjectCode: 'CS301',
        date: '2026-09-16',
        startTime: '10:00',
        endTime: '12:00',
        room: 'Hall 101',
      },
    ];
  }

  async getResults(_examId?: string): Promise<RawResultRecord[]> {
    return [
      {
        externalId: 'RES-STU-001-CS301',
        studentExternalId: 'ERP-STU-001',
        examExternalId: 'EXAM-MIDTERM-1',
        subjectCode: 'CS301',
        marks: 88.5,
        maxMarks: 100,
        grade: 'A',
        gradePoint: 9.0,
      },
    ];
  }
}
