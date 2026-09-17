'use client';

import type { Attachment } from '@/types';
import { FileText, ImageIcon } from 'lucide-react';

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';
  const isDoc =
    attachment.type.includes('word') ||
    attachment.name.toLowerCase().endsWith('.docx') ||
    attachment.name.toLowerCase().endsWith('.doc');

  if (isImage) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block max-w-sm overflow-hidden rounded-xl border border-white/10 bg-surface-2 transition hover:border-white/25"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-64 w-full object-cover"
          width={640}
          height={400}
        />
      </a>
    );
  }

  return (
    <div className="mt-2 flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-surface-2 px-3 py-3 shadow-xs transition hover:border-white/25">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          isPdf ? 'bg-error/10 text-error' : isDoc ? 'bg-primary/10 text-teal' : 'bg-surface-3 text-muted'
        }`}
      >
        {isImage ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{attachment.name}</p>
        <p className="text-xs text-discord-muted">{formatBytes(attachment.size)}</p>
      </div>
    </div>
  );
}
