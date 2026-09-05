// src/app/admin/login/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "./admin-login-form";

export const metadata = {
  title: "Admin Login | Neos Astra",
  description: "Admin portal login for Neos Astra staff.",
};

export default async function AdminLoginPage() {
  // If already logged in, redirect to appropriate dashboard
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "SUPER_ADMIN") {
      redirect("/superadmin");
    }
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090C14] px-4">
      <AdminLoginForm />
    </div>
  );
}

