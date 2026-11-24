import type { Role } from "@/lib/api";

const styles: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700 ring-red-200",
  EDITOR: "bg-amber-100 text-amber-700 ring-amber-200",
  USER: "bg-gray-100 text-gray-700 ring-gray-200",
};

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[role]}`}>
      {role}
    </span>
  );
}
