import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-[#0F1420] p-8 shadow-2xl">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">
          403 Access Denied
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#F3F6FB]">
          Access Restricted
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#8891A8]">
          This area is restricted to Super Administrators only. Your account does not have sufficient administrative privileges to view this section.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/admin"
            className="rounded-lg bg-[#4DE8E0] px-5 py-2.5 text-xs font-semibold text-[#090C14] transition-all hover:bg-[#3cd2ca]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
