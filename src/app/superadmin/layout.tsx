import { auth } from "@/auth";
import AutoLogout from "../components/AutoLogout";
import SessionGuard from "../components/SessionGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <SessionGuard>
      <AutoLogout />
      {children}
    </SessionGuard>
  );
}
