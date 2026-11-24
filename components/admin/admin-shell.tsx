"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/form";
import RoleBadge from "@/components/role-badge";
import { isStaff, type Role } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Icon, { type IconName } from "./icons";
import { ToastProvider } from "./toast";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  /** Bo'sh bo'lsa — ADMIN ham EDITOR ham kira oladi. */
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  { label: "Menu", href: "/admin/menu", icon: "menu" },
  { label: "Comments", href: "/admin/comments", icon: "comments" },
  { label: "Users", href: "/admin/users", icon: "users", roles: ["ADMIN"] },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hozirgi sahifa uchun talab qilinadigan role (masalan, /admin/users faqat ADMIN).
  const currentItem = NAV_ITEMS.filter((item) => item.href !== "/admin" && isActive(pathname, item.href))[0];
  const allowedHere = !currentItem?.roles || (user ? currentItem.roles.includes(user.role) : false);
  const allowed = status === "authenticated" && !!user && isStaff(user.role) && allowedHere;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && !isStaff(user.role)) router.replace("/profile");
    else if (status === "authenticated" && user && isStaff(user.role) && !allowedHere) router.replace("/admin");
  }, [status, user, allowedHere, router]);

  if (!allowed || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand px-4 py-3 text-white lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="rounded-lg p-1.5 hover:bg-white/10">
            <Icon name="bars" className="h-6 w-6" />
          </button>
          <span className="text-base font-bold">Admin Panel</span>
          <span className="w-9" />
        </header>

        {/* Backdrop (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand text-white transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <Link href="/admin" className="shrink-0">
              <Image src="/image 2.png" width={100} height={70} alt="Restaurant logo" priority className="h-auto w-24 object-contain" />
            </Link>
            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {visibleItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active ? "bg-white text-brand shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/15 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <div className="mt-0.5">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-center text-xs font-medium transition hover:bg-white/10">
                View site
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-medium transition hover:bg-white/25"
              >
                <Icon name="logout" className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
