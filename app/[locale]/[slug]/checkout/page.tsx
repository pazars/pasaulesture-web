import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
import { getEventBySlug } from "@/app/data/events";
import CheckoutForm from "@/app/components/CheckoutForm";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

interface CheckoutPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export default async function CheckoutPage({
    params,
}: CheckoutPageProps) {
    const { slug, locale } = await params;

    const event = getEventBySlug(slug);
    const t = await getTranslations();

    if (!event) {
        notFound();
    }

    const eventUrl = locale === "en" ? `/en/${slug}` : `/${slug}`;

    return (
        <div
            className="min-h-screen py-8 md:py-12"
            style={{ background: 'linear-gradient(to bottom, #f5f0e6, #faf8f3)' }}
        >
            <div className="max-w-xl mx-auto px-4">
                {/* Back button */}
                <Link
                    href={eventUrl}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
                    aria-label={t("back_to_home")}
                >
                    <svg
                        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    <span>{t("button_back_to_event")}</span>
                </Link>

                {/* Title */}
                <h1 className="font-display text-4xl md:text-5xl text-slate-800 mb-8">
                    {t("checkout_title")}
                </h1>

                <Suspense fallback={
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                    </div>
                }>
                    <CheckoutForm event={event} />
                </Suspense>
            </div>
        </div>
    );
}
