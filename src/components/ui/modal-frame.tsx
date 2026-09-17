'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface ModalFrameProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
}

export function ModalFrame({
  open,
  onClose,
  labelledBy,
  children,
  className,
  closeLabel = 'Close modal',
}: ModalFrameProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-ink/5 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={cn(
              'relative w-full overflow-hidden rounded-3xl bg-surface shadow-card border border-white/12 outline outline-4 outline-white/10',
              className,
            )}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
              mass: 0.85,
            }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
