import Link from "next/link";

const navItems = [
  { href: "/puppies", label: "Available Puppies" },
  { href: "/about", label: "About" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          Exotic Bulldog Level
        </Link>
        <nav>
          <ul className="flex items-center gap-6 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
