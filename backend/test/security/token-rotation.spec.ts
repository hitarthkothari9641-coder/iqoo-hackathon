import { TokenService } from '../../src/modules/auth/token.service';

describe('Security: Token Rotation & Hash Verification Specification', () => {
  let tokenService: TokenService;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockPrismaService: any;
  let mockSecurityEventService: any;

  beforeEach(() => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
      verify: jest.fn(),
    };
    mockConfigService = {
      security: { jwtAccessSecret: 'super-secret-key-32-chars-min-length' },
    };
    mockPrismaService = {};
    mockSecurityEventService = {
      logEvent: jest.fn().mockResolvedValue(undefined),
    };

    tokenService = new TokenService(
      mockJwtService,
      mockConfigService,
      mockPrismaService,
      mockSecurityEventService,
    );
  });

  it('generates high entropy 64-char hex refresh tokens', () => {
    const token = tokenService.generateRefreshToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });

  it('consistently hashes refresh tokens using SHA-256', () => {
    const token = 'sample-random-refresh-token-12345';
    const hash1 = tokenService.hashRefreshToken(token);
    const hash2 = tokenService.hashRefreshToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });
});
