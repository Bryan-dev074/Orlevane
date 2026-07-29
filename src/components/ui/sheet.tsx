'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CURTAIN, SILK } from '@/lib/motion';
import { setScrollLock } from '@/components/chrome/smooth-scroll';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useDialog(open: boolean, onClose: () => void, panel: React.RefObject<HTMLDivElement | null>) {
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    setScrollLock(true);

    const node = panel.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      setScrollLock(false);
      restore.current?.focus({ preventScroll: true });
    };
  }, [open, onClose, panel]);
}

/** Panel lateral. Se usa para el carrito. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  labelClose,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  labelClose: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useDialog(open, onClose, panel);

  return (
    <AnimatePresence>
      {open && (
        <div className="no-print fixed inset-0 z-100">
          <motion.button
            type="button"
            aria-label={labelClose}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: SILK }}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[3px]"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.52, ease: CURTAIN }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col bg-paper shadow-lift-deep outline-none"
          >
            <div className="flex items-center justify-between border-b border-stone/25 px-6 py-5">
              <h2 id={id} className="display-sm">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={labelClose}
                className="-mr-2 grid h-10 w-10 place-items-center transition-colors hover:text-gilt"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                  <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.15" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="border-t border-stone/25 bg-paper">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Diálogo centrado. Se usa para guía de tallas, aviso de demo y 3-D Secure. */
export function Modal({
  open,
  onClose,
  title,
  children,
  labelClose,
  size = 'md',
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  labelClose: string;
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useDialog(open, dismissible ? onClose : () => {}, panel);

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <AnimatePresence>
      {open && (
        <div className="no-print fixed inset-0 z-100 grid place-items-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label={labelClose}
            onClick={dismissible ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: SILK }}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/55 backdrop-blur-[3px]"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.42, ease: SILK }}
            className={`relative flex max-h-[88vh] w-full ${width} flex-col bg-paper shadow-lift-deep outline-none`}
          >
            <div className="flex items-start justify-between gap-6 border-b border-stone/25 px-6 py-5 sm:px-8">
              <h2 id={id} className="display-md">
                {title}
              </h2>
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={labelClose}
                  className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center transition-colors hover:text-gilt"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.15" />
                  </svg>
                </button>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
