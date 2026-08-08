// src/superadmin/scripts/create-admin.ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const name = process.argv[2]?.trim();
  const email = process.argv[3]?.trim().toLowerCase();
  const password = process.argv[4];
  const roleArg = process.argv[5]?.toUpperCase(); // ADMIN or SUPER_ADMIN (default ADMIN)

  if (!name || !email || !password) {
    console.log("\n=======================================================");
    console.log("   NEOS ASTRA — CREATE / ADD ADMIN ACCOUNT SCRIPT      ");
    console.log("=======================================================\n");
    console.log("Usage: npx tsx src/superadmin/scripts/create-admin.ts <NAME> <EMAIL> <PASSWORD> [ROLE]\n");
    console.log("Example 1 (Admin):");
    console.log('  npx tsx src/superadmin/scripts/create-admin.ts "Rohan Sharma" rohan@neosastra.com Pass123!\n');
    console.log("Example 2 (Super Admin):");
    console.log('  npx tsx src/superadmin/scripts/create-admin.ts "Priya Singh" priya@neosastra.com Pass123! SUPER_ADMIN\n');
    process.exit(1);
  }

  const role = roleArg === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
  const isSuper = role === "SUPER_ADMIN";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role,
      canManageAdmins: isSuper,
      canDeleteUsers: isSuper,
      canEditCourses: true,
      canManageEvents: true,
      canManageContent: true,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
    },
    create: {
      name,
      email,
      passwordHash,
      role,
      canManageAdmins: isSuper,
      canDeleteUsers: isSuper,
      canEditCourses: true,
      canManageEvents: true,
      canManageContent: true,
      isActive: true,
    },
  });

  console.log("\n✅ Admin Account Saved to Database (Supabase)!");
  console.log(`   ID: ${admin.id}`);
  console.log(`   Name: ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Status: Active`);
  console.log(`\nUser can now log in at /admin/login (or /superadmin/login)!\n`);
}

main()
  .catch((err) => {
    console.error("❌ Failed to save admin to database:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
