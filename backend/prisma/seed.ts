import { PrismaClient, InstitutionStatus, InstitutionType, UserStatus, MembershipStatus, IntegrationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const env = process.env.APP_ENV || 'development';
  if (env === 'production') {
    console.warn('[SEED] WARNING: Seeding is strictly disabled in production environments.');
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
      legalName: 'College OS Higher Education Institute',
      primaryDomain: 'demo.collegeos.edu',
      type: InstitutionType.COLLEGE,
      status: InstitutionStatus.ACTIVE,
      settings: {
        registrationMode: 'OPEN',
        theme: {
          primaryColor: '#1E293B',
          secondaryColor: '#475569',
          accentColor: '#0EA5E9',
        },
      },
    },
  });

  console.log(`[SEED] Institution initialized: ${institution.name} (${institution.id})`);

  // 2. Create Granular System Permissions
  const permissions = [
    { name: 'profile.read.self', description: 'Read own profile', module: 'users' },
    { name: 'profile.update.self', description: 'Update own profile', module: 'users' },
    { name: 'sessions.read.self', description: 'View active sessions', module: 'auth' },
    { name: 'sessions.revoke.self', description: 'Revoke own sessions', module: 'auth' },
    { name: 'users.read', description: 'View institutional members', module: 'users' },
    { name: 'users.update', description: 'Update user profiles', module: 'users' },
    { name: 'memberships.read', description: 'View institution memberships', module: 'institutions' },
    { name: 'roles.read', description: 'View institutional roles', module: 'roles' },
    { name: 'roles.assign', description: 'Assign roles to members', module: 'roles' },
    { name: 'audit.read', description: 'View security audit logs', module: 'audit' },
    { name: 'platform.institutions.manage', description: 'Manage platform institutions', module: 'platform' },
    // Phase 3 ERP Integration & Academic Permissions
    { name: 'integrations.read', description: 'View ERP integrations', module: 'integrations' },
    { name: 'integrations.create', description: 'Connect new ERP provider', module: 'integrations' },
    { name: 'integrations.update', description: 'Configure ERP settings', module: 'integrations' },
    { name: 'integrations.test', description: 'Test ERP connection', module: 'integrations' },
    { name: 'integrations.sync', description: 'Trigger manual ERP sync', module: 'integrations' },
    { name: 'integrations.pause', description: 'Pause ERP synchronization', module: 'integrations' },
    { name: 'integrations.disconnect', description: 'Disconnect ERP provider', module: 'integrations' },
    { name: 'academics.read', description: 'View academic records', module: 'academics' },
  ];

  const permMap = new Map<string, string>();
  for (const perm of permissions) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permMap.set(perm.name, p.id);
  }

  // 3. Create System Roles for Tenant
  const studentRole = await prisma.role.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: 'STUDENT' } },
    update: {},
    create: {
      institutionId: institution.id,
      name: 'STUDENT',
      description: 'Standard enrolled student role',
      isSystemRole: true,
    },
  });

  const facultyRole = await prisma.role.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: 'FACULTY' } },
    update: {},
    create: {
      institutionId: institution.id,
      name: 'FACULTY',
      description: 'Teaching faculty member role',
      isSystemRole: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { institutionId_name: { institutionId: institution.id, name: 'COLLEGE_ADMIN' } },
    update: {},
    create: {
      institutionId: institution.id,
      name: 'COLLEGE_ADMIN',
      description: 'Institutional administrator role',
      isSystemRole: true,
    },
  });

  // Connect Role Permissions
  const studentPerms = ['profile.read.self', 'profile.update.self', 'sessions.read.self', 'sessions.revoke.self', 'academics.read'];
  for (const pName of studentPerms) {
    const pId = permMap.get(pName);
    if (pId) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: studentRole.id, permissionId: pId } },
        update: {},
        create: { roleId: studentRole.id, permissionId: pId },
      });
    }
  }

  const adminPerms = [
    ...studentPerms,
    'users.read',
    'users.update',
    'memberships.read',
    'roles.read',
    'roles.assign',
    'audit.read',
    'integrations.read',
    'integrations.create',
    'integrations.update',
    'integrations.test',
    'integrations.sync',
    'integrations.pause',
    'integrations.disconnect',
  ];
  for (const pName of adminPerms) {
    const pId = permMap.get(pName);
    if (pId) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: pId } },
        update: {},
        create: { roleId: adminRole.id, permissionId: pId },
      });
    }
  }

  // 4. Create Development Demo Users
  const passwordHash = await bcrypt.hash('DevPassword123!', 10);

  const demoStudent = await prisma.user.upsert({
    where: { email: 'student@demo.collegeos.edu' },
    update: {},
    create: {
      email: 'student@demo.collegeos.edu',
      passwordHash,
      firstName: 'Aarav',
      lastName: 'Sharma',
      displayName: 'Aarav Sharma',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.collegeos.edu' },
    update: {},
    create: {
      email: 'admin@demo.collegeos.edu',
      passwordHash,
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      displayName: 'Dr. Rajesh Kumar',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // 5. Create Memberships
  const studentMembership = await prisma.institutionMembership.upsert({
    where: { userId_institutionId: { userId: demoStudent.id, institutionId: institution.id } },
    update: {},
    create: {
      userId: demoStudent.id,
      institutionId: institution.id,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  const adminMembership = await prisma.institutionMembership.upsert({
    where: { userId_institutionId: { userId: demoAdmin.id, institutionId: institution.id } },
    update: {},
    create: {
      userId: demoAdmin.id,
      institutionId: institution.id,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
    },
  });

  await prisma.membershipRole.upsert({
    where: { membershipId_roleId: { membershipId: studentMembership.id, roleId: studentRole.id } },
    update: {},
    create: { membershipId: studentMembership.id, roleId: studentRole.id },
  });

  await prisma.membershipRole.upsert({
    where: { membershipId_roleId: { membershipId: adminMembership.id, roleId: adminRole.id } },
    update: {},
    create: { membershipId: adminMembership.id, roleId: adminRole.id },
  });

  // 6. Create Default Integration Providers
  await prisma.integrationProvider.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Mock ERP Provider (Development Only)',
      vendor: 'College OS Mock Suite',
      version: '1.0.0',
      type: IntegrationType.FILE_IMPORT,
      capabilities: {
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
      },
    },
  });

  await prisma.integrationProvider.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Generic Campus ERP',
      vendor: 'Generic ERP Systems',
      version: '2.4.0',
      type: IntegrationType.API_KEY,
      capabilities: {
        students: true,
        faculty: true,
        subjects: true,
        attendance: true,
        timetable: true,
        exams: true,
        results: true,
      },
    },
  });

  console.log('[SEED] Demo Seeding complete with Integration Providers.');
}

main()
  .catch((e) => {
    console.error('[SEED] Error during development seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
