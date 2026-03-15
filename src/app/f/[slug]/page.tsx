import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ContentFeed } from '@/components/content-feed';
import { DonationsList } from '@/components/donations/donations-list';
import { DonationsSkeleton } from '@/components/donations/donations-skeleton';
import { Description } from '@/components/fundraiser/description';
import { DonateSidebar } from '@/components/fundraiser/donate-sidebar';
import { FundraiserMeta } from '@/components/fundraiser/fundraiser-meta';
import { HeroImage } from '@/components/fundraiser/hero-image';
import { MobileDonateBar } from '@/components/fundraiser/mobile-donate-bar';
import { OrganizerCard } from '@/components/fundraiser/organizer-card';
import { ProgressBar } from '@/components/fundraiser/progress-bar';
import { getContentByFundraiserId } from '@/lib/queries/content';
import {
  getAllFundraiserSlugs,
  getFundraiserBySlug,
} from '@/lib/queries/fundraisers';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllFundraiserSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFundraiserBySlug(slug);

  if (!data) {
    return { title: 'Fundraiser Not Found' };
  }

  const { fundraiser } = data;

  return {
    title: `${fundraiser.title} | GoFundMe Reimagined`,
    description:
      fundraiser.description?.slice(0, 160) ??
      'Support this fundraiser on GoFundMe Reimagined.',
    openGraph: {
      title: fundraiser.title,
      description:
        fundraiser.description?.slice(0, 160) ??
        'Support this fundraiser on GoFundMe Reimagined.',
      images: fundraiser.heroImageUrl ? [fundraiser.heroImageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fundraiser.title,
      description:
        fundraiser.description?.slice(0, 160) ??
        'Support this fundraiser on GoFundMe Reimagined.',
      images: fundraiser.heroImageUrl ? [fundraiser.heroImageUrl] : [],
    },
  };
}

export default async function FundraiserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getFundraiserBySlug(slug);

  if (!data) {
    notFound();
  }

  const { fundraiser, organizer, community } = data;
  const contentItems = await getContentByFundraiserId(fundraiser.id);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* Left column — main content */}
          <div className="min-w-0">
            <HeroImage
              src={fundraiser.heroImageUrl}
              alt={fundraiser.title}
            />

            <h1 className="mt-6 text-2xl font-bold text-gfm-dark sm:text-3xl">
              {fundraiser.title}
            </h1>

            {/* Mobile-only progress bar */}
            <div className="mt-4 lg:hidden">
              <ProgressBar
                raisedCents={fundraiser.raisedCents ?? 0}
                goalCents={fundraiser.goalCents}
                donationCount={fundraiser.donationCount ?? 0}
              />
            </div>

            <div className="mt-6">
              <OrganizerCard
                organizer={organizer}
                community={community}
                variant="inline"
              />
            </div>

            <hr className="my-6 border-border" />

            <Description text={fundraiser.description ?? ''} />

            <hr className="my-6 border-border" />

            <FundraiserMeta
              createdAt={fundraiser.createdAt}
              category={fundraiser.category}
              taxDeductible={fundraiser.taxDeductible ?? false}
            />

            <hr className="my-6 border-border" />

            {/* Donations list */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-gfm-dark">
                Donations ({fundraiser.donationCount ?? 0})
              </h2>
              <Suspense fallback={<DonationsSkeleton />}>
                <DonationsList fundraiserId={fundraiser.id} />
              </Suspense>
            </section>

            {/* Content feed */}
            {contentItems.length > 0 && (
              <>
                <hr className="my-6 border-border" />
                <section>
                  <h2 className="mb-4 text-lg font-bold text-gfm-dark">
                    Updates &amp; Content
                  </h2>
                  <ContentFeed items={contentItems} />
                  <Link
                    href={`/fyp?source=fundraiser&id=${fundraiser.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gfm-green hover:underline"
                  >
                    More like this &rarr;
                  </Link>
                </section>
              </>
            )}
          </div>

          {/* Right column — sticky sidebar (desktop only) */}
          <aside className="hidden lg:block">
            <DonateSidebar
              fundraiser={fundraiser}
              organizer={organizer}
              community={community}
            />
          </aside>
        </div>
      </div>

      {/* Mobile sticky donate bar */}
      <MobileDonateBar
        raisedCents={fundraiser.raisedCents ?? 0}
        goalCents={fundraiser.goalCents}
        slug={fundraiser.slug}
      />
    </>
  );
}
