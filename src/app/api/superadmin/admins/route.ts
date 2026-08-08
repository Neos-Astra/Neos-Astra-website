// src/app/api/superadmin/admins/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/superadmin/prisma/client";
import { auth } from "@/superadmin/auth";
import bcrypt from "bcryptjs";

// GET: list all admin users
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        canManageAdmins: true,
        canDeleteUsers: true,
        canEditCourses: true,
        canManageEvents: true,
        canManageContent: true,
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("GET admins error:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

// POST: create new admin user
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const formattedEmail = email.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({
      where: { email: formattedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An admin account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const assignedRole = role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    const isSuper = assignedRole === "SUPER_ADMIN";

    const admin = await prisma.adminUser.create({
      data: {
        name,
        email: formattedEmail,
        passwordHash,
        role: assignedRole,
        canManageAdmins: isSuper,
        canDeleteUsers: isSuper,
        canEditCourses: true,
        canManageEvents: true,
        canManageContent: true,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}

// PATCH: update admin details or change password
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, newPassword, isActive, role } = body;

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (role && (role === "ADMIN" || role === "SUPER_ADMIN")) {
      updateData.role = role;
      updateData.canManageAdmins = role === "SUPER_ADMIN";
      updateData.canDeleteUsers = role === "SUPER_ADMIN";
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
      updateData.failedLoginCount = 0;
      updateData.lockedUntil = null;
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

// DELETE: delete an admin user
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id || body.email;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: "Admin ID or Email is required" }, { status: 400 });
    }

    // Find the target admin user
    const targetAdmin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ id: id }, { email: id.toLowerCase().trim() }],
      },
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Prevent deleting oneself
    if (targetAdmin.id === session.user.id || targetAdmin.email.toLowerCase() === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot delete your own logged-in Super Admin account" },
        { status: 400 }
      );
    }

    // First delete any connected audit logs if present
    await prisma.auditLog.deleteMany({
      where: { adminUserId: targetAdmin.id },
    });

    // Delete the admin user
    await prisma.adminUser.delete({
      where: { id: targetAdmin.id },
    });

    return NextResponse.json({ success: true, message: `Deleted ${targetAdmin.email}` });
  } catch (error: any) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete admin" },
      { status: 500 }
    );
  }
}

