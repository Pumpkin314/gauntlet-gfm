import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fund You Page | GoFundMe Reimagined',
  description:
    'Discover inspiring fundraisers in a full-screen, scrollable feed.',
};

/**
 * FYP-specific layout.
 *
 * The root layout renders <SiteNav /> and <SiteFooter />. Rather than modifying
 * the root layout we render a full-viewport fixed container that visually
 * covers everything underneath, giving the FYP its own immersive experience.
 */
export default function FYPLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
