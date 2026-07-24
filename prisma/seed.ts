/**
 * Norcel — Database seed.
 *
 * Creates the default RBAC roles (USER, ADMIN, SUPER_ADMIN) and three
 * demo accounts (admin, super admin, regular user). Run with:
 *   `npm run prisma:seed`
 *
 * Reads admin credentials from environment so a developer can override
 * them without touching code. Falls back to safe dev defaults.
 */
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  return hash(plain, {
    type: 2, // argon2id
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

async function main() {
  console.log("🌱 Seeding database…");

  // 1. Roles
  const [userRole, adminRole, superAdminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: UserRole.USER },
      update: {},
      create: {
        name: UserRole.USER,
        description: "Default member — access to dashboard + profile.",
      },
    }),
    prisma.role.upsert({
      where: { name: UserRole.ADMIN },
      update: {},
      create: {
        name: UserRole.ADMIN,
        description:
          "Administrator — access to admin panel, user list, security log.",
      },
    }),
    prisma.role.upsert({
      where: { name: UserRole.SUPER_ADMIN },
      update: {},
      create: {
        name: UserRole.SUPER_ADMIN,
        description:
          "Super-admin — destructive admin actions, account restoration, role management.",
      },
    }),
  ]);

  console.log(
    `  ✓ Roles: ${userRole.name}, ${adminRole.name}, ${superAdminRole.name}`
  );

  // 2. Super-admin (highest privilege — also signs in to admin pages)
  const superAdminEmail =
    process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@norcel.dev";
  const superAdminPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD ?? "SuperAdmin123!";
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      passwordHash: await hashPassword(superAdminPassword),
      emailVerified: new Date(),
      roleId: superAdminRole.id,
    },
    create: {
      email: superAdminEmail,
      name: "Norcel Super-Admin",
      passwordHash: await hashPassword(superAdminPassword),
      emailVerified: new Date(),
      roleId: superAdminRole.id,
    },
  });
  console.log(`  ✓ Super-Admin: ${superAdmin.email}`);

  // 3. Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@norcel.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: await hashPassword(adminPassword),
      emailVerified: new Date(),
      roleId: adminRole.id,
    },
    create: {
      email: adminEmail,
      name: "Norcel Admin",
      passwordHash: await hashPassword(adminPassword),
      emailVerified: new Date(),
      roleId: adminRole.id,
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // 4. Demo USER
  const userEmail = process.env.SEED_USER_EMAIL ?? "user@norcel.dev";
  const userPassword = process.env.SEED_USER_PASSWORD ?? "UserDemo123!";
  const demoUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      passwordHash: await hashPassword(userPassword),
      emailVerified: new Date(),
      roleId: userRole.id,
    },
    create: {
      email: userEmail,
      name: "Demo User",
      passwordHash: await hashPassword(userPassword),
      emailVerified: new Date(),
      roleId: userRole.id,
    },
  });
  console.log(`  ✓ User:  ${demoUser.email}`);

  console.log("✅ Seed complete.\n");
  console.log("Super-admin login:");
  console.log(`  email:    ${superAdminEmail}`);
  console.log(`  password: ${superAdminPassword}`);
  console.log("Admin login:");
  console.log(`  email:    ${adminEmail}`);
  console.log(`  password: ${adminPassword}`);
  console.log("User login:");
  console.log(`  email:    ${userEmail}`);
  console.log(`  password: ${userPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
