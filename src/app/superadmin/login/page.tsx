import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  // Check if session exists on the server side
  const session = await auth();

  // Protect against back-button caching: Server components force redirect
  if (session?.user) {
    redirect("/superadmin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090C14] px-6 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-8 text-center text-[#8891A8]">
            Loading login form...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
