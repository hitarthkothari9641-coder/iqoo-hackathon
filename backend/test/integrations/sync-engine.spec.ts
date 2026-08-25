import { NormalizationService } from '../../src/modules/integrations/normalization/normalization.service';
import {
  CircuitBreakerService,
  CircuitState,
} from '../../src/modules/integrations/resilience/circuit-breaker.service';
import { AttendanceStatus, SubjectType, ExamType } from '@prisma/client';

describe('ERP Integration: Normalization & Circuit Breaker Specification', () => {
  let normalizationService: NormalizationService;
  let circuitBreakerService: CircuitBreakerService;

  beforeEach(() => {
    normalizationService = new NormalizationService();
    circuitBreakerService = new CircuitBreakerService();
  });

  describe('Normalization Engine', () => {
    it('normalizes attendance statuses correctly', () => {
      expect(normalizationService.normalizeAttendanceStatus('P')).toBe(
        AttendanceStatus.PRESENT,
      );
      expect(normalizationService.normalizeAttendanceStatus('Present')).toBe(
        AttendanceStatus.PRESENT,
      );
      expect(normalizationService.normalizeAttendanceStatus('A')).toBe(
        AttendanceStatus.ABSENT,
      );
      expect(normalizationService.normalizeAttendanceStatus('Absent')).toBe(
        AttendanceStatus.ABSENT,
      );
      expect(normalizationService.normalizeAttendanceStatus('L')).toBe(
        AttendanceStatus.LATE,
      );
      expect(normalizationService.normalizeAttendanceStatus('E')).toBe(
        AttendanceStatus.EXCUSED,
      );
    });

    it('normalizes subject types correctly', () => {
      expect(normalizationService.normalizeSubjectType('Practical Lab')).toBe(
        SubjectType.LAB,
      );
      expect(normalizationService.normalizeSubjectType('Open Elective')).toBe(
        SubjectType.ELECTIVE,
      );
      expect(normalizationService.normalizeSubjectType('Core Course')).toBe(
        SubjectType.CORE,
      );
    });

    it('normalizes exam types correctly', () => {
      expect(normalizationService.normalizeExamType('Midterm Test 1')).toBe(
        ExamType.MIDTERM,
      );
      expect(normalizationService.normalizeExamType('End Semester Final')).toBe(
        ExamType.END_SEMESTER,
      );
      expect(normalizationService.normalizeExamType('Pop Quiz')).toBe(
        ExamType.QUIZ,
      );
    });
  });

  describe('Circuit Breaker Resilience Engine', () => {
    it('starts in CLOSED state', () => {
      expect(circuitBreakerService.getState('integration-1')).toBe(
        CircuitState.CLOSED,
      );
      expect(circuitBreakerService.canExecute('integration-1')).toBe(true);
    });

    it('transitions to OPEN state after 5 consecutive failures', () => {
      const key = 'failing-integration';
      for (let i = 0; i < 5; i++) {
        circuitBreakerService.recordFailure(key);
      }
      expect(circuitBreakerService.getState(key)).toBe(CircuitState.OPEN);
      expect(circuitBreakerService.canExecute(key)).toBe(false);
    });
  });
});
