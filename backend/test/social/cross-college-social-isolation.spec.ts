import { AuthorizationService } from '../../src/common/guards/authorization.service';

describe('Social OS Security: Cross-College Isolation Specification', () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService(null as any);
  });

  it('DENIES College A user from accessing College B social posts or communities', async () => {
    const collegeAUser = {
      userId: 'user-college-a',
      institutionId: 'college-a-id',
      roles: ['STUDENT'],
      permissions: ['social.post.read'],
      isSuperAdmin: false,
    };

    const isAllowed = await authorizationService.can(
      collegeAUser,
      'social.post.read',
      'user-college-b',
      'college-b-id', // College B resource tenant!
    );

    expect(isAllowed).toBe(false);
  });
});
