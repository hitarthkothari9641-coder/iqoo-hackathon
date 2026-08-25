import { AuthorizationService } from '../../src/common/guards/authorization.service';

describe('Academic OS Security: Student Data Isolation Specification', () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService(null as any);
  });

  it('ALLOWS Student A to access own private notes', async () => {
    const studentContext = {
      userId: 'student-a-id',
      institutionId: 'college-a-id',
      roles: ['STUDENT'],
      permissions: ['profile.read.self'],
      isSuperAdmin: false,
    };

    const isAllowed = await authorizationService.can(
      studentContext,
      'profile.read.self',
      'student-a-id', // Resource owned by Student A
      'college-a-id',
    );

    expect(isAllowed).toBe(true);
  });

  it('DENIES Student B from reading Student A private notes or assignment submissions', async () => {
    const studentBContext = {
      userId: 'student-b-id',
      institutionId: 'college-a-id',
      roles: ['STUDENT'],
      permissions: ['profile.read.self'],
      isSuperAdmin: false,
    };

    const isAllowed = await authorizationService.can(
      studentBContext,
      'profile.read.self',
      'student-a-id', // Target resource belongs to Student A!
      'college-a-id',
    );

    expect(isAllowed).toBe(false);
  });
});
