"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/books", label: "Books" },
  { href: "/publishers", label: "Publishers" },
  { href: "/authors", label: "Authors" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 px-6 py-4">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-3 items-center">
        <Link href="/" className="w-fit text-xl font-bold transition hover:opacity-80">
          MyLibrary
        </Link>

        <nav className="col-start-2 flex items-center justify-center gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-black/15 hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div aria-hidden="true" />
      </div>
    </header>
  );
}
