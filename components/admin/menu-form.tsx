"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Field } from "@/components/form";
import { getErrorMessage, type Menu } from "@/lib/api";
import Icon from "./icons";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]; // backend UploadService bilan bir xil
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface Props {
  initial?: Menu;
  onSubmit: (form: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function MenuForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string; image?: string }>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return setFile(null);
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setErrors((p) => ({ ...p, image: "Only JPG, PNG or WEBP images are allowed" }));
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_SIZE) {
      setErrors((p) => ({ ...p, image: "Image must be 5 MB or smaller" }));
      e.target.value = "";
      return;
    }
    setErrors((p) => ({ ...p, image: undefined }));
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    const numericPrice = Number(price);
    // price backend'da integer ustun — butun son talab qilinadi
    if (price.trim() === "" || !Number.isInteger(numericPrice) || numericPrice < 0) {
      next.price = "Price must be a whole number (0 or more)";
    }
    if (!initial && !file) next.image = "Image is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const form = new FormData();
    form.append("name", name.trim());
    form.append("price", String(numericPrice));
    if (file) form.append("image", file); // backend FileInterceptor('image')

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  const shownImage = preview ?? initial?.image ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && <Alert>{serverError}</Alert>}

      <Field
        label="Name"
        placeholder="e.g. Adana Kebab"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors((p) => ({ ...p, name: undefined }));
        }}
        error={errors.name}
      />
      <Field
        label="Price ($)"
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        placeholder="25"
        value={price}
        onChange={(e) => {
          setPrice(e.target.value);
          setErrors((p) => ({ ...p, price: undefined }));
        }}
        error={errors.price}
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">Image</span>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-300">
            {shownImage ? (
              <Image src={shownImage} alt="Preview" width={96} height={96} unoptimized className="h-full w-full object-cover" />
            ) : (
              <Icon name="photo" className="h-8 w-8" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={onFileChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              {initial ? "Leave empty to keep the current image. " : ""}JPG, PNG or WEBP, up to 5 MB.
            </p>
            {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? "Save changes" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
