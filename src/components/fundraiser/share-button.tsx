'use client';

import { Check, Link as LinkIcon, Share2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title?: string;
  text?: string;
  /** Full button style or icon-only */
  variant?: 'full' | 'icon';
}

export function ShareButton({
  title,
  text,
  variant = 'full',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    // Try Web Share API on mobile
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: title ?? 'GoFundMe Reimagined',
          text: text ?? 'Check out this fundraiser!',
          url,
        });
        return;
      } catch {
        // User cancelled or API failed — fall through to copy
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [title, text]);

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        aria-label="Share fundraiser"
      >
        {copied ? (
          <Check className="h-4 w-4 text-gfm-green" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-gfm-green" />
          Link copied!
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
