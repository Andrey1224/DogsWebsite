'use client';

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { slugifyName } from "@/lib/admin/puppies/slug";
import { createPuppyAction } from "./actions";
import { initialCreatePuppyState, type CreatePuppyState } from "./types";

type StatusOption = {
  value: string;
  label: string;
};

interface CreatePuppyPanelProps {
  statusOptions: StatusOption[];
}

export function CreatePuppyPanel({ statusOptions }: CreatePuppyPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState(statusOptions[0]?.value ?? "available");

  const [state, formAction, pending] = useActionState<CreatePuppyState, FormData>(createPuppyAction, initialCreatePuppyState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Puppy created");
      formRef.current?.reset();
      setName("");
      setSlug("");
      setSlugManuallyEdited(false);
      setStatus(statusOptions[0]?.value ?? "available");
      setIsOpen(false);
      router.refresh();
    } else if (state.status === "error" && state.formError) {
      toast.error(state.formError);
    }
  }, [state, router, statusOptions]);

  useEffect(() => {
    if (!slugManuallyEdited) {
      const nextSlug = slugifyName(name);
      setSlug(nextSlug);
    }
  }, [name, slugManuallyEdited]);

  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text">Add new puppy</p>
          <p className="text-xs text-muted">Create a listing with name, status, price, and optional birth date.</p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-hover"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? "Close form" : "Add puppy"}
        </button>
      </div>

      {isOpen ? (
        <form
          ref={formRef}
          action={formAction}
          aria-label="Create puppy form"
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-text">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError("name") ? <p className="text-xs text-red-500">{fieldError("name")}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-text">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugManuallyEdited(true);
              }}
              disabled={pending}
              required
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError("slug") ? <p className="text-xs text-red-500">{fieldError("slug")}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-text">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError("status") ? <p className="text-xs text-red-500">{fieldError("status")}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="priceUsd" className="text-sm font-medium text-text">
              Price (USD)
            </label>
            <input
              id="priceUsd"
              name="priceUsd"
              type="number"
              inputMode="decimal"
              step="100"
              placeholder="4200"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError("priceUsd") ? <p className="text-xs text-red-500">{fieldError("priceUsd")}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="birthDate" className="text-sm font-medium text-text">
              Birth date
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError("birthDate") ? <p className="text-xs text-red-500">{fieldError("birthDate")}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="litterId" className="text-sm font-medium text-text">
              Litter ID (optional)
            </label>
            <input
              id="litterId"
              name="litterId"
              placeholder="UUID"
              disabled={pending}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {fieldError("litterId") ? <p className="text-xs text-red-500">{fieldError("litterId")}</p> : null}
          </div>

          {state.formError ? (
            <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.formError}
            </div>
          ) : null}

          <div className="col-span-full flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[color:var(--btn-bg,#0D1A44)] px-4 py-2 text-sm font-semibold text-[color:var(--btn-text,#FFFFFF)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving..." : "Create puppy"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (pending) return;
                setIsOpen(false);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-hover"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
