import { CONTACT_DETAILS } from "@/lib/config/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white/80 py-10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-serif text-lg font-semibold tracking-tight">Exotic Bulldog Level</p>
          <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
            Responsible French & English bulldog breeding in Alabama with health-first
            practices, transparent pedigrees, and life-long owner support.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-neutral-600 dark:text-neutral-300">
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-100">Visit</p>
            <p>Montgomery, AL</p>
            <p>By appointment only</p>
          </div>
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-100">Connect</p>
            <ul className="mt-1 space-y-1">
              <li>
                <a href={`mailto:${CONTACT_DETAILS.email.address}`}>{CONTACT_DETAILS.email.address}</a>
              </li>
              <li>
                <a href={`tel:${CONTACT_DETAILS.phone.e164}`}>{CONTACT_DETAILS.phone.display}</a>
              </li>
              <li>
                <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-5xl px-6 text-xs text-neutral-500 dark:text-neutral-400">
        © {new Date().getFullYear()} Exotic Bulldog Level. All rights reserved.
      </div>
    </footer>
  );
}
