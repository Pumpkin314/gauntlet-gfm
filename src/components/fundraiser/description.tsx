'use client';

import { useState } from 'react';

interface DescriptionProps {
  text: string;
}

export function Description({ text }: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <div>
      <div
        className={
          expanded
            ? 'whitespace-pre-line text-sm leading-relaxed text-gfm-dark'
            : 'line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-gfm-dark'
        }
      >
        {text}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-sm font-semibold text-gfm-green hover:underline"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}
