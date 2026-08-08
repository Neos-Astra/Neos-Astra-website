// src/superadmin/scripts/create-super-admin.ts
import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n==============================================");
  console.log("   NEOS ASTRA — CREATE SUPER ADMIN ACCOUNT   ");
  console.log("==============================================\n");

  let name: string;
  let email: string;
  let password: string;

  // If arguments are supplied (node script <name> <email> <password>) use them, otherwise fall back to interactive prompts.
  if (process.argv.length >= 5) {
    // argv[0] = node, argv[1] = script path, then our args
    [, , name, email, password] = process.argv;
    console.log(`Using supplied arguments: ${name} <${email}>`);
  } else {
    // Interactive mode
    name = (await question("Enter Full Name: ")).trim();
    if (!name) {
      console.error("Error: Name cannot be empty.");
      process.exit(1);
    }
    email = (await question("Enter Email Address: ")).trim().toLowerCase();
    if (!email || !email.includes("@")) {
      console.error("Error: Please provide a valid email address.");
      process.exit(1);
    }
    password = "";
    while (password.length < 12) {
      password = await question("Enter Password (min 12 characters): ");
      if (password.length < 12) {
        console.log("❌ Password must be at least 12 characters long. Try again.\n");
      }
    }
  }

  console.log("\nHashing password with 12 salt rounds...");
  const passwordHash = await bcrypt.hash(password, 12);

  console.log("Saving Super Admin user to database...");
  const superAdmin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "SUPER_ADMIN",
      canManageAdmins: true,
      canDeleteUsers: true,
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
      role: "SUPER_ADMIN",
      canManageAdmins: true,
      canDeleteUsers: true,
      canEditCourses: true,
      canManageEvents: true,
      canManageContent: true,
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SUPER_ADMIN_CREATED",
      adminUserId: superAdmin.id,
      details: `Super Admin account initialized for ${email}`,
    },
  });

  console.log("\n✅ Super Admin created successfully!");
  console.log(`   ID: ${superAdmin.id}`);
  console.log(`   Name: ${superAdmin.name}`);
  console.log(`   Email: ${superAdmin.email}`);
  console.log(`   Role: ${superAdmin.role}`);
  console.log("\nYou can now sign in at /superadmin/login\n");
}

main();
