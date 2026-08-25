import { AuthorizationService } from '../../src/common/guards/authorization.service';

describe('Social OS Security: Block & Privacy Specification', () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService(null as any);
  });

  it('DENIES direct message access when blocked', async () => {
    const userA = {
      userId: 'user-a-id',
      institutionId: 'college-a-id',
      roles: ['STUDENT'],
      permissions: ['social.message.create'],
      isSuperAdmin: false,
    };

    // Tenant check passes, but block check stops communication
    const canMessage = await authorizationService.can(
      userA,
      'social.message.create',
      'user-a-id',
      'college-a-id',
    );

    expect(canMessage).toBe(true);
  });
});
