import { CONTACT_DETAILS } from "@/lib/config/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-footer py-10 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-serif text-lg font-semibold tracking-tight">Exotic Bulldog Level</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Responsible French & English bulldog breeding in Alabama with health-first
            practices, transparent pedigrees, and life-long owner support.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-muted">
          <div>
            <p className="font-semibold text-text">Visit</p>
            <p>Montgomery, AL</p>
            <p>By appointment only</p>
          </div>
          <div>
            <p className="font-semibold text-text">Connect</p>
            <ul className="mt-1 space-y-1">
              <li>
                <a className="hover:opacity-80" href={`mailto:${CONTACT_DETAILS.email.address}`}>
                  {CONTACT_DETAILS.email.address}
                </a>
              </li>
              <li>
                <a className="hover:opacity-80" href={`tel:${CONTACT_DETAILS.phone.e164}`}>
                  {CONTACT_DETAILS.phone.display}
                </a>
              </li>
              <li>
                <a className="hover:opacity-80" href="https://instagram.com/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-5xl px-6 text-xs text-muted">
        © {new Date().getFullYear()} Exotic Bulldog Level. All rights reserved.
      </div>
    </footer>
  );
}
