import { notFound } from "next/navigation";
import { getStripeClient } from "@/app/lib/stripe";
import { getEventBySlug } from "@/app/data/events";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, slug } = await params;
  const { session_id } = await searchParams;
  const t = await getTranslations();

  // Validate session ID exists
  if (!session_id) {
    return (
      <div
        className="min-h-screen py-8 md:py-12"
        style={{ background: 'linear-gradient(to bottom, #f5f0e6, #faf8f3)' }}
      >
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800 mb-1">
                  {t("checkout_error_title")}
                </h1>
                <p className="text-slate-600 text-sm">{t("checkout_no_session")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch event data
  const event = getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  // Fetch Stripe session
  let session;
  try {
    const stripe = getStripeClient();
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return (
      <div
        className="min-h-screen py-8 md:py-12"
        style={{ background: 'linear-gradient(to bottom, #f5f0e6, #faf8f3)' }}
      >
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800 mb-1">
                  {t("checkout_error_title")}
                </h1>
                <p className="text-slate-600 text-sm">{t("checkout_invalid_session")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract metadata
  const participantName = session.metadata?.participant_name || "N/A";
  const distanceIndex = parseInt(session.metadata?.distance_index || "0", 10);
  const distance = event.distances[distanceIndex];
  const amountPaid = session.amount_total
    ? (session.amount_total / 100).toFixed(2)
    : "0.00";

  // Extract discount information
  const originalPriceFromMetadata = session.metadata?.original_price
    ? parseInt(session.metadata.original_price)
    : null;
  const hasDiscount = originalPriceFromMetadata && session.amount_total && originalPriceFromMetadata > session.amount_total;
  const originalAmount = originalPriceFromMetadata
    ? (originalPriceFromMetadata / 100).toFixed(2)
    : null;
  const savedAmount = hasDiscount && originalPriceFromMetadata && session.amount_total
    ? ((originalPriceFromMetadata - session.amount_total) / 100).toFixed(2)
    : null;

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
          {t("checkout_success_title")}
        </h1>

        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  {t("checkout_registration_confirmed")}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {new Date().toLocaleDateString(locale === "lv" ? "lv-LV" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Registration Details Card - opaque white, solid */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                  {t("label_participant")}
                </span>
                <span className="text-white font-semibold">
                  {participantName}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Event */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {t("label_event")}
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {t(event.nameKey as any)}
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {t("label_distance")}
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {t(distance.nameKey as any)}
                </div>
              </div>

              {/* Amount Paid */}
              <div className="pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  {hasDiscount && originalAmount && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {t("label_original_price")}
                      </span>
                      <span className="text-lg font-medium text-slate-400 line-through">
                        €{originalAmount}
                      </span>
                    </div>
                  )}
                  {hasDiscount && savedAmount && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                        {t("label_discount_saved")}
                      </span>
                      <span className="text-base font-semibold text-emerald-600">
                        -€{savedAmount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {t("label_amount_paid")}
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">€{amountPaid}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email confirmation notice */}
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
            <svg
              className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-blue-700">
              {t("checkout_confirmation_email")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
