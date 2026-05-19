"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  FileText,
  LogOut,
  User,
  Box,
  ShieldCheck,
} from "lucide-react";

const nav = [
  { href: "/sourcing", label: "Product Sourcing", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/documents", label: "Documents", icon: FileText },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null } | undefined;
  role?: string;
}

export default function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-indigo-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-indigo-800">
        <div className="flex items-center gap-2 mb-1">
          <Box size={22} className="text-indigo-300" />
          <span className="font-bold text-lg">ExportAgent</span>
        </div>
        <p className="text-indigo-400 text-xs">China Factory Platform</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-indigo-700 text-white"
                : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        {role === "ADMIN" && (
          <>
            <div className="pt-3 pb-1 px-3 text-indigo-400 text-xs uppercase tracking-wider font-semibold">Admin</div>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-indigo-700 text-white"
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              )}
            >
              <ShieldCheck size={18} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Buyer"}</p>
            <p className="text-indigo-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 text-indigo-300 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-indigo-800 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
