// src/app/superadmin/admins/page.tsx
import AdminsManagement from "./admins";

export const metadata = {
  title: "Manage Admins | Neos Astra Super Admin",
  description: "Manage admin accounts, passwords, and permissions.",
};

export default function AdminsPage() {
  return <AdminsManagement />;
}
