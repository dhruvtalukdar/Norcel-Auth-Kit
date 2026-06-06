/**
 * ForgeStack — Database seed
 *
 * Creates the default RBAC roles (USER, ADMIN) and a single admin user.
 * Run with: `npm run prisma:seed`
 *
 * Reads admin credentials from environment so a developer can override them
 * without touching code. Falls back to safe dev defaults.
 */
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // 1. Roles
  const [userRole, adminRole] = await Promise.all([
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
        description: "Administrator — access to admin panel and user management.",
      },
    }),
  ]);

  console.log(`  ✓ Roles: ${userRole.name}, ${adminRole.name}`);

  // 2. Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@forgestack.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "ForgeStack Admin";

  const passwordHash = await hash(adminPassword, {
    type: 2, // argon2id
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      emailVerified: new Date(),
      roleId: adminRole.id,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      emailVerified: new Date(),
      roleId: adminRole.id,
    },
  });

  console.log(`  ✓ Admin: ${admin.email}`);

  // 3. Demo USER
  const userEmail = process.env.SEED_USER_EMAIL ?? "user@forgestack.dev";
  const userPassword = process.env.SEED_USER_PASSWORD ?? "UserDemo123!";

  const userHash = await hash(userPassword, {
    type: 2,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  const demoUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: { passwordHash: userHash, emailVerified: new Date(), roleId: userRole.id },
    create: {
      email: userEmail,
      name: "Demo User",
      passwordHash: userHash,
      emailVerified: new Date(),
      roleId: userRole.id,
    },
  });

  console.log(`  ✓ User:  ${demoUser.email}`);
  console.log("✅ Seed complete.\n");
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
