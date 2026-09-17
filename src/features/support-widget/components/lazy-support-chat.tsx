'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SupportChatWidget = dynamic(
  () =>
    import('@/features/support-widget/components/support-chat-widget').then(
      (mod) => mod.SupportChatWidget,
    ),
  { ssr: false },
);

export function LazySupportChat() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    const idleApi = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (typeof idleApi.requestIdleCallback === 'function') {
      idleId = idleApi.requestIdleCallback(enable, { timeout: 2500 });
    } else {
      timer = setTimeout(enable, 1200);
    }

    const onInteract = () => enable();
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('click', onInteract, { once: true });

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof idleApi.cancelIdleCallback === 'function') {
        idleApi.cancelIdleCallback(idleId);
      }
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('click', onInteract);
    };
  }, []);

  if (!ready) return null;
  return <SupportChatWidget />;
}
