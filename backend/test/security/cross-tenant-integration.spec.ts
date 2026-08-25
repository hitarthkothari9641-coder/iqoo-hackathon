import { AuthorizationService } from '../../src/common/guards/authorization.service';

describe('Security: Integration Cross-Tenant Boundaries Specification', () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService(null as any);
  });

  it('ALLOWS College A Admin to manage integrations for College A', async () => {
    const adminContext = {
      userId: 'admin-college-a',
      institutionId: 'college-a-id',
      roles: ['COLLEGE_ADMIN'],
      permissions: ['integrations.read', 'integrations.sync'],
      isSuperAdmin: false,
    };

    const isAllowed = await authorizationService.can(
      adminContext,
      'integrations.sync',
      undefined,
      'college-a-id',
    );

    expect(isAllowed).toBe(true);
  });

  it('DENIES College A Admin from triggering sync on College B integration (Cross-Tenant Security Rule)', async () => {
    const adminContext = {
      userId: 'admin-college-a',
      institutionId: 'college-a-id',
      roles: ['COLLEGE_ADMIN'],
      permissions: ['integrations.read', 'integrations.sync'],
      isSuperAdmin: false,
    };

    const isAllowed = await authorizationService.can(
      adminContext,
      'integrations.sync',
      undefined,
      'college-b-id', // Resource belongs to College B!
    );

    expect(isAllowed).toBe(false);
  });
});
