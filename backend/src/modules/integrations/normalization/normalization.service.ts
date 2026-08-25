import { Injectable } from '@nestjs/common';
import { AttendanceStatus, SubjectType, ExamType } from '@prisma/client';

@Injectable()
export class NormalizationService {
  normalizeAttendanceStatus(statusStr: string): AttendanceStatus {
    if (!statusStr) return AttendanceStatus.OTHER;
    const clean = statusStr.trim().toUpperCase();

    if (
      clean === 'P' ||
      clean === 'PRESENT' ||
      clean === '1' ||
      clean === 'YES'
    ) {
      return AttendanceStatus.PRESENT;
    }
    if (
      clean === 'A' ||
      clean === 'ABSENT' ||
      clean === '0' ||
      clean === 'NO'
    ) {
      return AttendanceStatus.ABSENT;
    }
    if (clean === 'L' || clean === 'LATE') {
      return AttendanceStatus.LATE;
    }
    if (clean === 'E' || clean === 'EXCUSED') {
      return AttendanceStatus.EXCUSED;
    }

    return AttendanceStatus.OTHER;
  }

  normalizeSubjectType(typeStr?: string): SubjectType {
    if (!typeStr) return SubjectType.CORE;
    const clean = typeStr.trim().toUpperCase();

    if (clean.includes('LAB') || clean.includes('PRACTICAL')) {
      return SubjectType.LAB;
    }
    if (clean.includes('ELECTIVE') || clean.includes('OPTIONAL')) {
      return SubjectType.ELECTIVE;
    }
    if (clean.includes('PROJECT')) {
      return SubjectType.PROJECT;
    }

    return SubjectType.CORE;
  }

  normalizeExamType(typeStr?: string): ExamType {
    if (!typeStr) return ExamType.INTERNAL;
    const clean = typeStr.trim().toUpperCase();

    if (clean.includes('MID') || clean.includes('INTERNAL')) {
      return ExamType.MIDTERM;
    }
    if (
      clean.includes('END') ||
      clean.includes('FINAL') ||
      clean.includes('SEMESTER')
    ) {
      return ExamType.END_SEMESTER;
    }
    if (clean.includes('QUIZ')) {
      return ExamType.QUIZ;
    }
    if (clean.includes('PRACTICAL') || clean.includes('LAB')) {
      return ExamType.PRACTICAL;
    }

    return ExamType.OTHER;
  }

  parseDate(dateStr: string): Date {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date format received from ERP: ${dateStr}`);
    }
    return parsed;
  }
}
