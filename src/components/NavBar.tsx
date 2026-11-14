"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/day", label: "Tag" },
  { href: "/week", label: "Woche" },
  { href: "/formcheck", label: "Formcheck" },
  { href: "/training", label: "Training" },
  { href: "/nutrition", label: "Ernährung" },
  { href: "/habits", label: "Habits" },
];

export function NavBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/30"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={handleSignOut}
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          Abmelden
        </button>
      </div>
    </nav>
  );
}
