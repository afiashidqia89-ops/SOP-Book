"use client";
// Layout dashboard dengan sidebar — guard: hanya role admin yang boleh masuk
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, canManageSop } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "📊 Dashboard", manageOnly: false },
  { href: "/sop", label: "📄 Kelola SOP", manageOnly: true },
  { href: "/users", label: "👥 Kelola User", manageOnly: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [user, loading]);

  if (loading || !user) {
    return <main className="flex min-h-screen items-center justify-center text-gray-500">Memuat…</main>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-palm-800 text-white">
        <div className="border-b border-palm-700 px-5 py-5">
          <p className="text-lg font-bold">🌴 e-SOP Sawit</p>
          <p className="text-xs text-palm-100">Web Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.filter((n) => !n.manageOnly || canManageSop(user)).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                pathname.startsWith(n.href) ? "bg-palm-600 font-semibold" : "hover:bg-palm-700"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-palm-700 p-4 text-sm">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-palm-100">{ROLE_LABEL[user.role]}</p>
          <button onClick={logout} className="mt-3 w-full rounded-lg bg-palm-700 px-3 py-1.5 text-xs hover:bg-palm-600">
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}
