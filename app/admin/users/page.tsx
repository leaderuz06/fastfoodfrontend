"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Spinner } from "@/components/form";
import Icon from "@/components/admin/icons";
import { ConfirmDialog, Modal } from "@/components/admin/modal";
import PageHeader, { EmptyState, Panel } from "@/components/admin/page-header";
import { useToast } from "@/components/admin/toast";
import UserForm from "@/components/admin/user-form";
import RoleBadge from "@/components/role-badge";
import { getErrorMessage, userApi, type Role, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 10;
const ROLES: Role[] = ["USER", "EDITOR", "ADMIN"];

// Faqat ADMIN: kirish cheklovi AdminShell'da (role !== ADMIN bo'lsa /admin'ga qaytariladi),
// backend ham GET /user'ni @Roles(ADMIN) bilan himoyalagan.
export default function UsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<{ key: string; users: User[] } | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [roleChange, setRoleChange] = useState<{ user: User; role: Role } | null>(null);
  const [roleBusy, setRoleBusy] = useState(false);

  const requestKey = `${page}:${reloadKey}`;
  const loading = !data || data.key !== requestKey;

  useEffect(() => {
    let cancelled = false;
    userApi
      .list((page - 1) * PAGE_SIZE, PAGE_SIZE)
      .then((users) => {
        if (cancelled) return;
        setData({ key: requestKey, users });
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [page, requestKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const users = data?.users ?? [];
  // Backend umumiy sonni qaytarmaydi — to'liq sahifa kelsa, keyingisi bo'lishi mumkin deb hisoblaymiz.
  const hasNext = !loading && users.length === PAGE_SIZE;

  async function saveUser(changes: Partial<Pick<User, "name" | "email" | "phone">>) {
    if (!editing) return;
    await userApi.update(editing.id, changes);
    toast.success("User updated");
    setEditing(null);
    reload();
  }

  async function confirmRoleChange() {
    if (!roleChange) return;
    setRoleBusy(true);
    try {
      await userApi.updateRole(roleChange.user.id, roleChange.role);
      toast.success(`${roleChange.user.name} is now ${roleChange.role}`);
      setRoleChange(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRoleBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await userApi.remove(deleting.id);
      toast.success("User deleted");
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Registered accounts. Only administrators can see this page." />

      {error && <Alert>{error}</Alert>}

      {loading && !error && (
        <div className="flex justify-center py-24 text-brand">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {!loading && (
        <Panel>
          {users.length === 0 ? (
            <EmptyState message="No users on this page." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Phone</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isMe = u.id === me?.id;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900">
                                {u.name}
                                {isMe && <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>}
                              </p>
                              <p className="truncate text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{u.phone}</td>
                        <td className="px-5 py-3">
                          {isMe ? (
                            <RoleBadge role={u.role} />
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => setRoleChange({ user: u, role: e.target.value as Role })}
                              aria-label={`Role of ${u.name}`}
                              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-600">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditing(u)}
                              aria-label={`Edit ${u.name}`}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                              <Icon name="pencil" className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(u)}
                              disabled={isMe}
                              aria-label={`Delete ${u.name}`}
                              title={isMe ? "You cannot delete your own account" : undefined}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <span className="text-sm text-gray-500">Page {page}</span>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-4 py-2" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="secondary" className="px-4 py-2" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <Modal open={editing !== null} title="Edit user" onClose={() => setEditing(null)}>
        {editing && <UserForm key={editing.id} user={editing} onSubmit={saveUser} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={roleChange !== null}
        title="Change role"
        message={`Change ${roleChange?.user.name ?? "this user"} from ${roleChange?.user.role ?? ""} to ${roleChange?.role ?? ""}?${
          roleChange?.role === "ADMIN" ? " Admins have full access, including managing other users." : ""
        }`}
        confirmLabel="Change role"
        danger={false}
        loading={roleBusy}
        onConfirm={confirmRoleChange}
        onClose={() => setRoleChange(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete user"
        message={`Delete ${deleting?.name ?? "this user"} (${deleting?.email ?? ""})? Their account will be deactivated.`}
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
