// src/superadmin/scripts/change-password.ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log("\nUsage: npx tsx src/superadmin/scripts/change-password.ts <email> <newPassword>\n");
    console.log("Example: npx tsx src/superadmin/scripts/change-password.ts admin@neosastra.com MyNewPass123!\n");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ Error: No account found with email: ${email}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({
    where: { email },
    data: {
      passwordHash,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  console.log(`\n✅ Password updated successfully for: ${email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Status: Active\n`);
}

main()
  .catch((err) => {
    console.error("Failed to update password:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
