"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthShell from "@/components/auth-shell";
import { Alert, Button, Field, PasswordField } from "@/components/form";
import { getErrorMessage, homeFor } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Values = { name: string; email: string; phone: string; password: string; confirm: string };
type Errors = Partial<Record<keyof Values, string>>;

// Backend CreateUserDto qoidalari bilan bir xil: name 3-20, password 3-20, phone 3-13, email.
function validate(v: Values): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 3 || v.name.trim().length > 20) errors.name = "Name must be 3–20 characters";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "Enter a valid email address";
  if (v.phone.trim().length < 3 || v.phone.trim().length > 13) errors.phone = "Phone must be 3–13 characters";
  if (v.password.length < 3 || v.password.length > 20) errors.password = "Password must be 3–20 characters";
  if (v.confirm !== v.password) errors.confirm = "Passwords do not match";
  return errors;
}

export default function RegisterPage() {
  const { register, user, status } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<Values>({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) router.replace(homeFor(user));
  }, [status, user, router]);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const me = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      });
      router.replace(homeFor(me)); // yangi foydalanuvchi har doim USER -> /profile
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Register to get started."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}
        <Field label="Full name" autoComplete="name" placeholder="John Doe" value={values.name} onChange={set("name")} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={set("email")} error={errors.email} />
        <Field label="Phone" type="tel" autoComplete="tel" placeholder="+998901234567" value={values.phone} onChange={set("phone")} error={errors.phone} />
        <PasswordField label="Password" autoComplete="new-password" placeholder="3–20 characters" value={values.password} onChange={set("password")} error={errors.password} />
        <PasswordField label="Confirm password" autoComplete="new-password" placeholder="Repeat your password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
