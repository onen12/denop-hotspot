"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/routers", label: "Routers" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/transactions", label: "Transactions" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center font-bold">
              D
            </div>
            <div>
              <div className="font-semibold text-sm">Denop Hostel</div>
              <div className="text-xs text-slate-400">Wifi Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-sky-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition"
          >
            Sign out
          </button>
          <Link
            href="/portal"
            className="block text-center text-xs text-slate-400 hover:text-white"
          >
            View Customer Portal →
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-800">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}