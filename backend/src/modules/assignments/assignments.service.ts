import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignmentStatus, SubmissionStatus } from '@prisma/client';

export interface CreateAssignmentOptions {
  institutionId: string;
  facultyUserId: string;
  subjectId: string;
  sectionId?: string;
  title: string;
  description: string;
  instructions?: string;
  dueAt: Date;
  maxMarks?: number;
  allowLate?: boolean;
}

export interface SubmitAssignmentOptions {
  assignmentId: string;
  studentUserId: string;
  content?: string;
  fileUrl?: string;
}

export interface GradeSubmissionOptions {
  submissionId: string;
  facultyUserId: string;
  grade: number;
  feedback?: string;
}

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getFacultyProfile(userId: string, institutionId: string) {
    const faculty = await this.prisma.facultyProfile.findFirst({
      where: { userId, institutionId },
    });
    if (!faculty) {
      throw new ForbiddenException({
        code: 'FACULTY_PROFILE_REQUIRED',
        message: 'Active faculty profile required in the selected institution.',
      });
    }
    return faculty;
  }

  private async getStudentProfile(userId: string, institutionId: string) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { userId, institutionId },
    });
    if (!student) {
      throw new ForbiddenException({
        code: 'STUDENT_PROFILE_REQUIRED',
        message: 'Active student profile required in the selected institution.',
      });
    }
    return student;
  }

  async createAssignment(options: CreateAssignmentOptions) {
    const faculty = await this.getFacultyProfile(
      options.facultyUserId,
      options.institutionId,
    );

    const assignment = await this.prisma.assignment.create({
      data: {
        institutionId: options.institutionId,
        subjectId: options.subjectId,
        sectionId: options.sectionId,
        facultyId: faculty.id,
        title: options.title,
        description: options.description,
        instructions: options.instructions,
        dueAt: options.dueAt,
        maxMarks: options.maxMarks || 100,
        allowLate: options.allowLate !== undefined ? options.allowLate : true,
        status: AssignmentStatus.DRAFT,
      },
    });

    return assignment;
  }

  async publishAssignment(
    assignmentId: string,
    facultyUserId: string,
    institutionId: string,
  ) {
    const faculty = await this.getFacultyProfile(facultyUserId, institutionId);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    if (assignment.facultyId !== faculty.id) {
      throw new ForbiddenException(
        'Cannot publish assignments created by another faculty member.',
      );
    }

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: AssignmentStatus.PUBLISHED },
    });
  }

  async getStudentAssignments(studentUserId: string, institutionId: string) {
    const student = await this.getStudentProfile(studentUserId, institutionId);

    const assignments = await this.prisma.assignment.findMany({
      where: {
        institutionId,
        status: { in: [AssignmentStatus.PUBLISHED, AssignmentStatus.CLOSED] },
      },
      include: {
        subject: { select: { code: true, name: true } },
        submissions: {
          where: { studentId: student.id },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            grade: true,
            feedback: true,
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      subject: a.subject,
      dueAt: a.dueAt,
      maxMarks: a.maxMarks,
      status: a.status,
      mySubmission: a.submissions[0] || null,
    }));
  }

  async submitAssignment(
    options: SubmitAssignmentOptions,
    institutionId: string,
  ) {
    const student = await this.getStudentProfile(
      options.studentUserId,
      institutionId,
    );

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: options.assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const now = new Date();
    const isLate = now > assignment.dueAt;

    if (isLate && !assignment.allowLate) {
      throw new BadRequestException({
        code: 'DEADLINE_PASSED',
        message: 'Submissions are closed for this assignment.',
      });
    }

    const submission = await this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: options.assignmentId,
          studentId: student.id,
        },
      },
      update: {
        content: options.content,
        fileUrl: options.fileUrl,
        submittedAt: now,
        isLate,
        status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      },
      create: {
        assignmentId: options.assignmentId,
        studentId: student.id,
        content: options.content,
        fileUrl: options.fileUrl,
        submittedAt: now,
        isLate,
        status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
      },
    });

    return submission;
  }

  async gradeSubmission(
    options: GradeSubmissionOptions,
    institutionId: string,
  ) {
    const faculty = await this.getFacultyProfile(
      options.facultyUserId,
      institutionId,
    );

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: options.submissionId },
      include: { assignment: true },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    if (submission.assignment.facultyId !== faculty.id) {
      throw new ForbiddenException(
        'Cannot grade submissions for assignments belonging to another faculty member.',
      );
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: options.submissionId },
      data: {
        grade: options.grade,
        feedback: options.feedback,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
      },
    });
  }
}
