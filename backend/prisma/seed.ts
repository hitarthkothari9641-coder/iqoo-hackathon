import { PrismaClient, InstitutionStatus, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const env = process.env.APP_ENV || 'development';
  if (env === 'production') {
    console.warn('[SEED] WARNING: Seeding is disabled in production environments.');
    return;
  }

  console.log(`[SEED] Seeding development database foundation (Environment: ${env})...`);

  // 1. Create Default Demo Institution
  const institution = await prisma.institution.upsert({
    where: { slug: 'demo-university' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'College OS Demonstration University',
      slug: 'demo-university',
      domain: 'demo.collegeos.edu',
      status: InstitutionStatus.ACTIVE,
      settings: {
        theme: {
          primaryColor: '#0A1128',
          secondaryColor: '#3B82F6',
          accentColor: '#10B981',
        },
        features: {
          social: false,
          erpSync: false,
          career: false,
        },
      },
    },
  });

  console.log(`[SEED] Created default institution: ${institution.name} (${institution.id})`);

  // 2. Create Core Permissions
  const permissions = [
    { name: 'system:health:read', description: 'Read system health status', module: 'system' },
    { name: 'institution:manage', description: 'Manage institutional settings', module: 'institutions' },
    { name: 'users:read', description: 'View institutional users', module: 'users' },
    { name: 'users:write', description: 'Create and edit users', module: 'users' },
    { name: 'audit:read', description: 'View security audit logs', module: 'audit' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log(`[SEED] Seeded ${permissions.length} core platform permissions.`);
}

main()
  .catch((e) => {
    console.error('[SEED] Error during development seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
