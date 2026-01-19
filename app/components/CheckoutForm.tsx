"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EventData, events } from "@/app/data/events";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

interface CheckoutFormProps {
    event: EventData;
}

interface StripePrice {
    priceId: string;
    eventSlug: string;
    distanceIndex: number;
    amount: number;
}

// Helper to get translated distance name
function getDistanceName(nameKey: string): string {
    const translations: Record<string, () => string> = {
        distance_adventure: m.distance_adventure,
        distance_challenge: m.distance_challenge,
        distance_long: m.distance_long,
    };
    return translations[nameKey]?.() ?? nameKey;
}

// Helper to get translated event name
function getEventName(nameKey: string): string {
    const translations: Record<string, () => string> = {
        event_egipte_malta: m.event_egipte_malta,
        event_parize_dakara: m.event_parize_dakara,
    };
    return translations[nameKey]?.() ?? nameKey;
}

export default function CheckoutForm({
    event,
}: CheckoutFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = getLocale();
    const allEvents = Object.values(events);

    // Derive selected distance from URL params or default to last option
    const selectedDistanceIndex = useMemo(() => {
        const distanceParam = searchParams.get("distance");
        if (distanceParam !== null) {
            const parsed = parseInt(distanceParam, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed < event.distances.length) {
                return parsed;
            }
        }
        return event.distances.length - 1;
    }, [searchParams, event.distances.length]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
    const [priceLoading, setPriceLoading] = useState(true);
    const [priceError, setPriceError] = useState<string | null>(null);

    // Load persisted form data on mount
    useEffect(() => {
        const savedName = localStorage.getItem("checkout_name");
        const savedEmail = localStorage.getItem("checkout_email");
        if (savedName || savedEmail) {
            setFormData(prev => ({
                ...prev,
                name: savedName || "",
                email: savedEmail || "",
            }));
        }

        // If no distance in URL, check if we have a persisted one for this event
        if (!searchParams.has("distance")) {
            const savedDistance = localStorage.getItem(`last_distance_${event.slug}`);
            if (savedDistance !== null) {
                const path = locale === "en" ? `/en/${event.slug}/checkout?distance=${savedDistance}` : `/${event.slug}/checkout?distance=${savedDistance}`;
                router.replace(path, { scroll: false });
            }
        }
    }, []); // Run only on mount

    // Fetch Stripe prices on mount
    useEffect(() => {
        async function fetchPrices() {
            try {
                const response = await fetch('/api/stripe/prices');
                if (!response.ok) {
                    throw new Error('Failed to fetch prices');
                }
                const data = await response.json();
                setStripePrices(data.prices || []);
            } catch (error) {
                console.error('Error fetching prices:', error);
                setPriceError('Failed to load pricing information');
            } finally {
                setPriceLoading(false);
            }
        }

        fetchPrices();
    }, []);

    // Save selection and check for redirected persistence
    useEffect(() => {
        localStorage.setItem(`last_distance_${event.slug}`, selectedDistanceIndex.toString());
        localStorage.setItem("last_event_slug", event.slug);
    }, [event.slug, selectedDistanceIndex]);

    const selectedDistance = event.distances[selectedDistanceIndex];
    const distanceName = getDistanceName(selectedDistance.nameKey);
    const eventName = getEventName(event.nameKey);
    const distanceFact = selectedDistance.facts.find((f) => f.icon === "route");
    const elevationFact = selectedDistance.facts.find((f) => f.icon === "mountain");

    // Find matching Stripe price
    const matchingPrice = stripePrices.find(
        p => p.eventSlug === event.slug && p.distanceIndex === selectedDistanceIndex
    );

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = m.checkout_error_required();
        }

        if (!formData.email.trim()) {
            newErrors.email = m.checkout_error_required();
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = m.checkout_error_email();
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = m.checkout_error_terms();
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!matchingPrice) {
            alert('Price information is not available. Please contact us.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventSlug: event.slug,
                    distanceIndex: selectedDistanceIndex,
                    name: formData.name,
                    email: formData.email,
                    locale,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Unable to start checkout. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Persist name and email
        if (field === "name") localStorage.setItem("checkout_name", value as string);
        if (field === "email") localStorage.setItem("checkout_email", value as string);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleEventChange = (newSlug: string) => {
        // When changing event, try to find matching distance name or use last selection
        const savedDistance = localStorage.getItem(`last_distance_${newSlug}`);
        const distParam = savedDistance !== null ? `?distance=${savedDistance}` : "";
        const path = locale === "en" ? `/en/${newSlug}/checkout${distParam}` : `/${newSlug}/checkout${distParam}`;
        router.push(path, { scroll: false });
    };

    const handleDistanceChange = (newIndex: number) => {
        const path = locale === "en" ? `/en/${event.slug}/checkout?distance=${newIndex}` : `/${event.slug}/checkout?distance=${newIndex}`;
        router.push(path, { scroll: false });
    };

    const termsUrl = locale === "en" ? "/en/noteikumi" : "/noteikumi";

    // Show error if price not found
    const showPriceError = !priceLoading && !matchingPrice;

    return (
        <div>
            {/* Notice Banner */}
            {showPriceError && (
                <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm text-red-700">
                            Registration is temporarily unavailable. Please contact us at pasaulesture@gmail.com
                        </p>
                    </div>
                </div>
            )}

            {/* Selected Event and Distance Info */}
            <div className="bg-forest-deep text-white rounded-2xl p-6 mb-8 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <p className="text-sand/70 text-sm uppercase tracking-wider">
                            {m.checkout_selection_label()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sand/60 text-xs uppercase tracking-widest mb-1">{m.checkout_price_label()}</p>
                        {priceLoading ? (
                            <p className="text-2xl font-display text-sand/50">Loading...</p>
                        ) : matchingPrice ? (
                            <p className="text-3xl font-display text-amber-glow">€{(matchingPrice.amount / 100).toFixed(0)}</p>
                        ) : (
                            <p className="text-xl font-display text-red-400">N/A</p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Event Dropdown */}
                    <div>
                        <label className="text-sand/80 text-xs uppercase tracking-wide mb-2 block">
                            {m.checkout_event_label()}
                        </label>
                        <div className="relative">
                            <select
                                value={event.slug}
                                onChange={(e) => handleEventChange(e.target.value)}
                                className="w-full bg-forest-medium/30 border border-sand/20 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-amber-light transition-colors font-semibold cursor-pointer"
                            >
                                {allEvents.map((e) => (
                                    <option key={e.slug} value={e.slug} className="bg-forest-deep text-white">
                                        {getEventName(e.nameKey)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sand/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Distance Dropdown */}
                    <div className="border-t border-sand/20 pt-4">
                        <label className="text-sand/80 text-xs uppercase tracking-wide mb-2 block">
                            {m.checkout_distance_label()}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedDistanceIndex.toString()}
                                onChange={(e) => handleDistanceChange(parseInt(e.target.value, 10))}
                                disabled={event.distances.length <= 1}
                                className={`w-full bg-forest-medium/30 border border-sand/20 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-amber-light transition-colors font-semibold ${event.distances.length <= 1 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                            >
                                {event.distances.map((d, idx) => (
                                    <option key={idx} value={idx.toString()} className="bg-forest-deep text-white">
                                        {getDistanceName(d.nameKey)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sand/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Facts row */}
                    {(distanceFact || elevationFact) && (
                        <div className="flex gap-6 text-sm border-t border-sand/10 pt-4">
                            {distanceFact && (
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-amber-light"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                    <span className="text-sand">{distanceFact.value}</span>
                                </div>
                            )}
                            {elevationFact && (
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-amber-light"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                                        />
                                    </svg>
                                    <span className="text-sand">{elevationFact.value}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-earth-dark mb-2"
                    >
                        {m.checkout_name_label()} <span className="text-amber">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${errors.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-sand focus:border-forest-medium"
                            } focus:outline-none bg-white`}
                        placeholder="Jānis Bērziņš"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-earth-dark mb-2"
                    >
                        {m.checkout_email_label()} <span className="text-amber">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-sand focus:border-forest-medium"
                            } focus:outline-none bg-white`}
                        placeholder="janis@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Terms Acceptance */}
                <div className="pt-4 border-t-2 border-sand/30">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={formData.acceptTerms}
                            onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-2 border-sand text-forest-deep focus:ring-2 focus:ring-forest-medium cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm text-earth-dark flex-1">
                            {m.checkout_terms_label()}{" "}
                            <Link
                                href={termsUrl}
                                target="_blank"
                                className="text-forest-medium hover:text-amber underline font-semibold inline-flex items-center gap-1"
                            >
                                {m.checkout_terms_link()}
                                <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                            <span className="text-amber"> *</span>
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="mt-2 text-sm text-red-600 ml-8">
                            {errors.acceptTerms}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || priceLoading || showPriceError}
                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            {m.checkout_submit()}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            {m.checkout_submit()}
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
}
