"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "@/components/form";
import PageHeader, { EmptyState, Panel } from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import { commentApi, getErrorMessage, menuApi, type CommentItem, type Menu } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/format";

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export default function DashboardPage() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([menuApi.list(), commentApi.list()])
      .then(([m, c]) => {
        if (cancelled) return;
        setMenus(m);
        setComments(c);
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!menus) return null;
    const total = menus.reduce((sum, m) => sum + m.price, 0);
    return {
      count: menus.length,
      mine: menus.filter((m) => m.userId === user?.id).length,
      average: menus.length ? Math.round(total / menus.length) : 0,
    };
  }, [menus, user?.id]);

  const recentMenus = useMemo(() => (menus ? [...menus].sort(byNewest).slice(0, 5) : []), [menus]);
  const recentComments = useMemo(() => (comments ? [...comments].sort(byNewest).slice(0, 5) : []), [comments]);

  if (error) return <Alert>{error}</Alert>;

  if (!menus || !comments || !stats) {
    return (
      <div className="flex justify-center py-24 text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name}`} description="Here is what is happening in your restaurant today." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Menu items" value={stats.count} />
        <StatCard label="Added by me" value={stats.mine} />
        <StatCard label="Comments" value={comments.length} />
        <StatCard label="Average price" value={formatPrice(stats.average)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Latest menu items</h2>
            <Link href="/admin/menu" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {recentMenus.length === 0 ? (
            <EmptyState message="No menu items yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentMenus.map((menu) => (
                <li key={menu.id} className="flex items-center gap-4 px-5 py-3">
                  <Image
                    src={menu.image}
                    alt={menu.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize text-gray-900">{menu.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(menu.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand">{formatPrice(menu.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Latest comments</h2>
            <Link href="/admin/comments" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {recentComments.length === 0 ? (
            <EmptyState message="No comments yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentComments.map((comment) => (
                <li key={comment.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-gray-900">{comment.user?.name}</p>
                    <span className="shrink-0 text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
