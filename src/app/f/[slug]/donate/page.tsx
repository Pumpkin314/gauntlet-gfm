import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DonateForm } from '@/components/donations/donate-form';
import { getCurrentUser } from '@/lib/auth';
import { formatCents } from '@/lib/format';
import { getFundraiserBySlug } from '@/lib/queries/fundraisers';

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

  return {
    title: `Donate to ${data.fundraiser.title} | GoFundMe Reimagined`,
  };
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getFundraiserBySlug(slug);

  if (!data) {
    notFound();
  }

  const { fundraiser } = data;
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link
            href={`/f/${fundraiser.slug}`}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-gfm-dark"
            aria-label="Back to fundraiser"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gfm-dark">
              {fundraiser.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCents(fundraiser.raisedCents ?? 0)} raised
            </p>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="mx-auto max-w-lg px-4 py-6 pb-10 sm:py-8">
        <h1 className="text-xl font-bold text-gfm-dark sm:text-2xl">
          Make a donation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your contribution makes a difference.
        </p>

        <div className="mt-6">
          <DonateForm
            fundraiserId={fundraiser.id}
            fundraiserSlug={fundraiser.slug}
            fundraiserTitle={fundraiser.title}
            raisedCents={fundraiser.raisedCents ?? 0}
            goalCents={fundraiser.goalCents}
            isAuthenticated={!!user}
          />
        </div>
      </div>

      {/* Celebration CSS animations */}
      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-up {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(calc(var(--i) * 30deg)) * 60px),
              calc(sin(calc(var(--i) * 30deg)) * 60px)
            ) scale(1);
            opacity: 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }

        .animate-fade-up {
          animation: fade-up 0.5s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-100 {
          animation-delay: 0.3s !important;
        }

        .animation-delay-200 {
          animation-delay: 0.4s !important;
        }

        .confetti-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color);
          animation: confetti-burst 0.8s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
