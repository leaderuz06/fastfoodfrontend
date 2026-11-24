"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "@/components/form";
import Icon from "@/components/admin/icons";
import { ConfirmDialog } from "@/components/admin/modal";
import PageHeader, { EmptyState, Panel, SearchInput } from "@/components/admin/page-header";
import { useToast } from "@/components/admin/toast";
import { commentApi, getErrorMessage, type CommentItem } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function CommentsPage() {
  const toast = useToast();
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<CommentItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setComments(await commentApi.list());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    if (!comments) return [];
    const q = search.trim().toLowerCase();
    const sorted = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.content.toLowerCase().includes(q) ||
        c.user?.name.toLowerCase().includes(q) ||
        c.user?.email.toLowerCase().includes(q),
    );
  }, [comments, search]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await commentApi.remove(deleting.id);
      toast.success("Comment deleted");
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Comments" description="Customer reviews shown on the website. Remove inappropriate ones." />

      {error && <Alert>{error}</Alert>}

      {!comments && !error && (
        <div className="flex justify-center py-24 text-brand">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {comments && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search comments or authors…" />
            <span className="text-sm text-gray-500">{visible.length} comment(s)</span>
          </div>

          {visible.length === 0 ? (
            <EmptyState message={search ? "No comments match your search." : "No comments yet."} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {visible.map((comment) => (
                <li key={comment.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                    {comment.user?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <p className="text-sm font-semibold text-gray-900">{comment.user?.name ?? "Unknown user"}</p>
                      <p className="truncate text-xs text-gray-500">{comment.user?.email}</p>
                      <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleting(comment)}
                    aria-label="Delete comment"
                    className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete comment"
        message={`Delete the comment by ${deleting?.user?.name ?? "this user"}? This cannot be undone.`}
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
