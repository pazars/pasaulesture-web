import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
import { getEventBySlug } from "@/app/data/events";
import CheckoutForm from "@/app/components/CheckoutForm";
import CheckoutHeader from "@/app/components/CheckoutHeader";
import Link from "next/link";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

interface CheckoutPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
    searchParams: Promise<{
        distance?: string;
    }>;
}

export default async function CheckoutPage({
    params,
    searchParams,
}: CheckoutPageProps) {
    const { slug, locale } = await params;
    const { distance } = await searchParams;

    const event = getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    const homeUrl = locale === "en" ? "/en" : "/";
    const eventUrl = locale === "en" ? `/en/${slug}` : `/${slug}`;

    return (
        <div className="min-h-screen bg-cream-light">
            <div className="max-w-5xl mx-auto">
                <CheckoutHeader />

                <main className="mt-6 mx-2 mb-8">
                    <div className="bg-cream rounded-3xl p-8 md:p-12">
                        <div className="max-w-2xl mx-auto">
                            <Link
                                href={homeUrl}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest-deep/10 hover:bg-forest-deep hover:text-white text-forest-deep transition-all mb-8 group"
                                aria-label={m.back_to_home()}
                            >
                                <svg
                                    className="w-6 h-6 transition-transform group-hover:scale-110"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                            </Link>

                            <h1 className="font-display text-4xl md:text-5xl text-forest-deep mb-3 text-center">
                                {m.checkout_title()}
                            </h1>
                            <div className="section-divider w-24 mx-auto mb-8" />

                            <CheckoutForm
                                event={event}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
