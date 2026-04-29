"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { CloseIcon, InstagramIcon } from "./Icons";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";

interface MobileMenuProps {
  currentSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ currentSlug, isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isDakar = currentSlug === "parize-dakara";
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const checkoutPath = `/${locale === "en" ? "en/" : ""}${currentSlug}/checkout`;

  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus close button on open
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    []
  );

  if (!isOpen) return null;

  const linkClass = `block text-center px-6 py-4 rounded-2xl font-accent font-semibold text-lg transition-all ${
    isDakar
      ? "text-beige bg-beige/8 active:bg-beige/15"
      : "text-beige bg-white/8 active:bg-white/15"
  }`;

  return (
    <div className="fixed inset-0 z-50 sm:hidden" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 mobile-menu-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`mobile-menu-panel absolute top-0 left-0 right-0 rounded-b-3xl shadow-2xl ${
          isDakar ? "bg-dakar-brown" : "bg-blue"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu_open")}
      >
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className={`p-3 rounded-full transition-colors ${
              isDakar
                ? "text-beige hover:bg-beige/15"
                : "text-beige hover:bg-white/15"
            }`}
            aria-label={t("menu_close")}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Page navigation */}
        <nav className="px-6 pb-2 flex flex-col gap-3">
          <Link
            href={checkoutPath}
            onClick={onClose}
            className={`block text-center px-6 py-4 rounded-2xl font-accent font-bold text-lg transition-all ${
              isDakar
                ? "bg-dakar-cream text-dakar-brown shadow-lg shadow-dakar-cream/30 active:shadow-dakar-cream/50"
                : "bg-pink text-blue shadow-lg shadow-pink/30 active:shadow-pink/50"
            }`}
          >
            {t("register_button")}
          </Link>
          <button onClick={() => scrollTo("route")} className={linkClass}>
            {t("section_route")}
          </button>
          <button onClick={() => scrollTo("event-plan")} className={linkClass}>
            {t("faq_badge")}
          </button>
        </nav>

        {/* Bottom row: Instagram + Language Switcher */}
        <div className="px-6 py-5 flex items-center justify-between">
          <a
            href="https://www.instagram.com/pasaulesture/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 transition-colors ${
              isDakar
                ? "text-beige hover:text-dakar-yellow"
                : "text-beige hover:text-pink"
            }`}
          >
            <InstagramIcon className="w-5 h-5" />
            <span className="text-sm font-medium">@pasaulesture</span>
          </a>

          <Suspense fallback={<div className="w-20 h-10" />}>
            <LanguageSwitcher isDakar={isDakar} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
