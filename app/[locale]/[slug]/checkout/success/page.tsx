import { notFound } from "next/navigation";
import { getStripeClient } from "@/app/lib/stripe";
import { getEventBySlug } from "@/app/data/events";
import * as m from "@/paraglide/messages";

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

  // Validate session ID exists
  if (!session_id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-deep to-forest-medium flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center">
          <h1 className="text-2xl font-display text-cream mb-4">
            {m.checkout_error_title()}
          </h1>
          <p className="text-cream-light">{m.checkout_no_session()}</p>
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
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest-deep to-forest-medium flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center">
          <h1 className="text-2xl font-display text-cream mb-4">
            {m.checkout_error_title()}
          </h1>
          <p className="text-cream-light">{m.checkout_invalid_session()}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-deep to-forest-medium flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass p-8 rounded-3xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-moss rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-cream"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-display text-cream text-center mb-4">
          {m.checkout_success_title()}
        </h1>
        <p className="text-cream-light text-center mb-8">
          {m.checkout_success_message()}
        </p>

        {/* Registration Details */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-3 border-b border-stone/30">
            <span className="text-cream-light">{m.label_participant()}:</span>
            <span className="text-cream font-medium">{participantName}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-stone/30">
            <span className="text-cream-light">{m.label_event()}:</span>
            <span className="text-cream font-medium">{m[event.nameKey]()}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-stone/30">
            <span className="text-cream-light">{m.label_distance()}:</span>
            <span className="text-cream font-medium">
              {m[distance.nameKey]()}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-stone/30">
            <span className="text-cream-light">{m.label_amount_paid()}:</span>
            <span className="text-cream font-medium">€{amountPaid}</span>
          </div>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-moss/20 border border-moss/30 rounded-xl p-4 mb-6">
          <p className="text-cream-light text-sm text-center">
            {m.checkout_confirmation_email()}
          </p>
        </div>

        {/* Back to Event Button */}
        <div className="text-center">
          <a
            href={`/${locale === "en" ? "en/" : ""}${slug}`}
            className="btn-secondary inline-block"
          >
            {m.button_back_to_event()}
          </a>
        </div>
      </div>
    </div>
  );
}
