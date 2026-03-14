import { Search } from "lucide-react";
import Link from "next/link";

import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";

import { MobileNav } from "./mobile-nav";

const navLinks = [
  { href: "/", label: "Discover" },
  { href: "/start", label: "Start a GoFundMe" },
  { href: "/how-it-works", label: "How It Works" },
] as const;

export async function SiteNav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Mobile hamburger */}
        <div className="flex items-center gap-3">
          <MobileNav user={user} navLinks={navLinks} />
          <Link href="/" className="text-xl font-bold text-gfm-green">
            GoFundMe
          </Link>
        </div>

        {/* Center: Desktop nav links */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gfm-dark transition-colors hover:text-gfm-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-5" />
          </Button>
          <div className="hidden md:block">
            {user ? (
              <UserMenu user={user} signOutAction={signOutAction} />
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
