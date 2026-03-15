"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOutAction } from "@/lib/actions/auth";

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  username: string | null;
  navLinks: ReadonlyArray<{ href: string; label: string; disabled?: boolean }>;
}

export function MobileNav({ user, username, navLinks }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open menu" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>
              <Link
                href="/"
                className="text-xl font-bold text-gfm-green"
                onClick={() => setOpen(false)}
              >
                GoFundMe
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
            {navLinks.map((link) =>
              link.disabled ? (
                <span
                  key={link.label}
                  className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground cursor-default"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-base font-medium text-gfm-dark transition-colors hover:bg-muted hover:text-gfm-green"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="border-t border-border px-4 py-4">
            {user ? (
              <UserMenu user={user} username={username} signOutAction={signOutAction} />
            ) : (
              <SignInButton />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
