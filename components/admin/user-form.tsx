"use client";

import { useState } from "react";
import { Alert, Button, Field } from "@/components/form";
import { getErrorMessage, type User } from "@/lib/api";

type Values = { name: string; email: string; phone: string };

// Backend UpdateUserDto (CreateUserDto'ning Partial varianti) qoidalari: name 3-20, phone 3-13, email.
function validate(v: Values) {
  const errors: Partial<Values> = {};
  if (v.name.trim().length < 3 || v.name.trim().length > 20) errors.name = "Name must be 3–20 characters";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "Enter a valid email address";
  if (v.phone.trim().length < 3 || v.phone.trim().length > 13) errors.phone = "Phone must be 3–13 characters";
  return errors;
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user: User;
  onSubmit: (changes: Partial<Values>) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Values>({ name: user.name, email: user.email, phone: user.phone });
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Faqat o'zgargan maydonlarni yuboramiz.
    const changes: Partial<Values> = {};
    (Object.keys(values) as (keyof Values)[]).forEach((key) => {
      const next = values[key].trim();
      if (next !== user[key]) changes[key] = next;
    });
    if (Object.keys(changes).length === 0) return onCancel();

    setSubmitting(true);
    try {
      await onSubmit(changes);
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && <Alert>{serverError}</Alert>}
      <Field label="Full name" value={values.name} onChange={set("name")} error={errors.name} />
      <Field label="Email" type="email" value={values.email} onChange={set("email")} error={errors.email} />
      <Field label="Phone" type="tel" value={values.phone} onChange={set("phone")} error={errors.phone} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
