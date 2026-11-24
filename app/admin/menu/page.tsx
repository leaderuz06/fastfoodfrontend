"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Spinner } from "@/components/form";
import Icon from "@/components/admin/icons";
import MenuForm from "@/components/admin/menu-form";
import { ConfirmDialog, Modal } from "@/components/admin/modal";
import PageHeader, { EmptyState, Panel, SearchInput } from "@/components/admin/page-header";
import { useToast } from "@/components/admin/toast";
import { getErrorMessage, menuApi, type Menu } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/format";

export default function MenuPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [menus, setMenus] = useState<Menu[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Menu | "new" | null>(null);
  const [deleting, setDeleting] = useState<Menu | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setMenus(await menuApi.list());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Backend mantig'i: ADMIN hamma menyuni, EDITOR esa faqat o'zi qo'shganini o'zgartira oladi.
  const canManage = useCallback(
    (menu: Menu) => user?.role === "ADMIN" || menu.userId === user?.id,
    [user],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!menus) return [];
    return q ? menus.filter((m) => m.name.toLowerCase().includes(q)) : menus;
  }, [menus, search]);

  async function save(form: FormData) {
    if (editing === "new") {
      await menuApi.create(form);
      toast.success("Menu item added");
    } else if (editing) {
      await menuApi.update(editing.id, form);
      toast.success("Menu item updated");
    }
    setEditing(null);
    await load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await menuApi.remove(deleting.id);
      toast.success("Menu item deleted");
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
      <PageHeader
        title="Menu"
        description="Add, edit and remove dishes shown on the website."
        action={
          <Button onClick={() => setEditing("new")}>
            <Icon name="plus" className="h-4 w-4" />
            Add item
          </Button>
        }
      />

      {error && <Alert>{error}</Alert>}

      {!menus && !error && (
        <div className="flex justify-center py-24 text-brand">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {menus && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name…" />
            <span className="text-sm text-gray-500">{visible.length} item(s)</span>
          </div>

          {visible.length === 0 ? (
            <EmptyState message={search ? "No items match your search." : "No menu items yet. Add the first one!"} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Created by</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((menu) => {
                    const manageable = canManage(menu);
                    return (
                      <tr key={menu.id} className="hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={menu.image}
                              alt={menu.name}
                              width={56}
                              height={56}
                              unoptimized
                              className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-cover"
                            />
                            <span className="font-medium capitalize text-gray-900">{menu.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-brand">{formatPrice(menu.price)}</td>
                        <td className="px-5 py-3 text-gray-600">{menu.user?.name ?? "—"}</td>
                        <td className="px-5 py-3 text-gray-600">{formatDate(menu.createdAt)}</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            {manageable ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditing(menu)}
                                  aria-label={`Edit ${menu.name}`}
                                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                >
                                  <Icon name="pencil" className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleting(menu)}
                                  aria-label={`Delete ${menu.name}`}
                                  className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <Icon name="trash" className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <span className="px-2 text-xs text-gray-400" title="You can only change your own items">
                                View only
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      <Modal
        open={editing !== null}
        title={editing === "new" ? "Add menu item" : "Edit menu item"}
        onClose={() => setEditing(null)}
      >
        {editing !== null && (
          <MenuForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? undefined : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete menu item"
        message={`Are you sure you want to delete “${deleting?.name ?? ""}”? This cannot be undone.`}
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
