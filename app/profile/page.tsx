"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@/components/form";
import RoleBadge from "@/components/role-badge";
import { isStaff } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function ProfilePage() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return (
      <main className="flex flex-1 items-center justify-center text-white">
        <Spinner className="h-8 w-8" />
      </main>
    );
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Full name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone },
    { label: "Role", value: <RoleBadge role={user.role} /> },
    { label: "Member since", value: formatDate(user.createdAt) },
  ];

  async function onLogout() {
    setLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center gap-4 bg-gray-50 px-8 py-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="truncate text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-100 px-8">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-4">
              <dt className="text-sm text-gray-500">{row.label}</dt>
              <dd className="text-right text-sm font-medium text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-end gap-3 px-8 py-6">
          {isStaff(user.role) && (
            <Link
              href="/admin"
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Open admin panel
            </Link>
          )}
          <Button variant="secondary" onClick={onLogout} loading={loggingOut}>
            Log out
          </Button>
        </div>
      </div>
    </main>
  );
}
