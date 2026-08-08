// src/app/admin/login/page.tsx
import AdminLoginForm from "./admin-login-form";

export const metadata = {
  title: "Admin Login | Neos Astra",
  description: "Admin portal login for Neos Astra staff.",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090C14] px-4">
      <AdminLoginForm />
    </div>
  );
}
