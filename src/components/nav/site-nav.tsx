import { eq } from "drizzle-orm";
import { Search } from "lucide-react";
import Link from "next/link";

import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import { MobileNav } from "./mobile-nav";

const navLinks: ReadonlyArray<{ href: string; label: string; disabled?: boolean }> = [
  { href: "/fyp", label: "Discover" },
  { href: "/fyp", label: "Fund You" },
  { href: "", label: "Start a GoFundMe", disabled: true },
  { href: "", label: "How It Works", disabled: true },
];

export async function SiteNav() {
  const user = await getCurrentUser();
  let username: string | null = null;
  if (user?.id) {
    const [row] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, user.id));
    username = row?.username ?? null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Mobile hamburger */}
        <div className="flex items-center gap-3">
          <MobileNav user={user} username={username} navLinks={navLinks} />
          <Link href="/" className="text-xl font-bold text-gfm-green">
            GoFundMe
          </Link>
        </div>

        {/* Center: Desktop nav links */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) =>
            link.disabled ? (
              <span
                key={link.label}
                className="text-sm font-medium text-muted-foreground cursor-default"
                title="Coming soon"
              >
                {link.label}
              </span>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gfm-dark transition-colors hover:text-gfm-green"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-5" />
          </Button>
          <div className="hidden md:block">
            {user ? (
              <UserMenu user={user} username={username} signOutAction={signOutAction} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
