"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EventData } from "@/app/data/events";
import { CONTACT_INFO } from "@/app/data/contact";
import { useTranslations, useLocale } from "next-intl";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface CheckoutFormProps {
    event: EventData;
}

interface StripePrice {
    priceId: string;
    eventSlug: string;
    distanceIndex: number;
    amount: number;
}

interface AccommodationAvailability {
    dorm: {
        total: number;
        remaining: number;
        available: boolean;
    };
}

export default function CheckoutForm({
    event,
}: CheckoutFormProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

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
        phone: "",
        needsAccommodation: false,
        accommodationType: "" as "" | "dorm" | "tent",
        wantsPreparationTips: false,
        preparationTipsChannels: [] as string[],
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
    const [priceLoading, setPriceLoading] = useState(true);
    const [priceError, setPriceError] = useState<string | null>(null);
    const [dormAvailability, setDormAvailability] = useState<AccommodationAvailability | null>(null);
    const [dormFullError, setDormFullError] = useState(false);
    const [submitError, setSubmitError] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [discountStatus, setDiscountStatus] = useState<"idle" | "checking" | "applied" | "error">("idle");
    const [discountData, setDiscountData] = useState<{ couponId: string; percentOff: number; code: string } | null>(null);
    const [discountError, setDiscountError] = useState("");

    // Load persisted form data on mount
    useEffect(() => {
        const savedName = localStorage.getItem("checkout_name");
        const savedEmail = localStorage.getItem("checkout_email");
        const savedPhone = localStorage.getItem("checkout_phone");
        if (savedName || savedEmail || savedPhone) {
            setFormData(prev => ({
                ...prev,
                name: savedName || "",
                email: savedEmail || "",
                phone: savedPhone || "",
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

    // Fetch accommodation availability on mount (only for events with accommodation)
    useEffect(() => {
        if (!event.hasAccommodation) return;

        async function fetchAccommodation() {
            try {
                const response = await fetch(`/api/accommodations/availability?eventSlug=${event.slug}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch accommodation');
                }
                const data = await response.json();
                setDormAvailability(data);
            } catch (error) {
                console.error('Error fetching accommodation:', error);
            }
        }

        fetchAccommodation();
    }, [event.slug, event.hasAccommodation]);

    // Save selection and check for redirected persistence
    useEffect(() => {
        localStorage.setItem(`last_distance_${event.slug}`, selectedDistanceIndex.toString());
        localStorage.setItem("last_event_slug", event.slug);
    }, [event.slug, selectedDistanceIndex]);

    // Handle ?error=… returns from server-side checkout redirect (303-back on failure).
    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (!errorParam) return;

        if (errorParam === "dorm_full") {
            setDormFullError(true);
            if (event.hasAccommodation) {
                fetch(`/api/accommodations/availability?eventSlug=${event.slug}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => { if (data) setDormAvailability(data); })
                    .catch(() => { /* swallow; banner still shown */ });
            }
        } else if (errorParam === "server" || errorParam === "missing_fields") {
            setSubmitError(true);
        }
        // price_unavailable falls through — the existing showPriceError banner handles it
        // once prices load (or fail to load).

        // Strip the error param so a manual reload doesn't re-trigger the banner.
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("error");
        const qs = newParams.toString();
        const path = locale === "en" ? `/en/${event.slug}/checkout` : `/${event.slug}/checkout`;
        router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    }, []); // mount-only

    const selectedDistance = event.distances[selectedDistanceIndex];
    const eventName = t(event.nameKey as any);
    const distanceFact = selectedDistance.facts.find((f) => f.icon === "route");
    const elevationFact = selectedDistance.facts.find((f) => f.icon === "mountain");

    // Find matching Stripe price
    const matchingPrice = stripePrices.find(
        p => p.eventSlug === event.slug && p.distanceIndex === selectedDistanceIndex
    );

    // Calculate final price with discount
    const originalPrice = matchingPrice?.amount ?? 0;
    let finalPrice = originalPrice;

    if (discountData && originalPrice > 0) {
        const discountAmount = originalPrice * (discountData.percentOff / 100);
        finalPrice = Math.round(originalPrice - discountAmount);
    }

    // Check if dorm is available or user must join waitlist
    const dormSpotsRemaining = dormAvailability?.dorm?.remaining ?? 0;
    const isDormWaitlist = dormSpotsRemaining <= 0;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("checkout_error_required");
        }

        if (!formData.email.trim()) {
            newErrors.email = t("checkout_error_required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("checkout_error_email");
        }

        if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
            newErrors.phone = t("checkout_error_phone");
        }

        if (formData.needsAccommodation && !formData.accommodationType) {
            newErrors.accommodationType = t("checkout_error_accommodation_type");
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = t("checkout_error_terms");
        }

        setErrors(newErrors);
        return newErrors;
    };

    const handleSubmit = (e: FormEvent) => {
        // Native form POST + 303 redirect: the browser owns the navigation, not JS.
        // Only call e.preventDefault() to block submission on validation failure.
        setDormFullError(false);
        setSubmitError(false);

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            e.preventDefault();
            const firstErrorKey = Object.keys(validationErrors)[0];
            document.getElementById(firstErrorKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        if (!matchingPrice) {
            e.preventDefault();
            alert('Price information is not available. Please contact us.');
            return;
        }

        // Allow native submission. Browser navigates on the server's 303 response.
        // isSubmitting stays true until the page is torn down.
        setIsSubmitting(true);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Persist name, email and phone
        if (field === "name") localStorage.setItem("checkout_name", value as string);
        if (field === "email") localStorage.setItem("checkout_email", value as string);
        if (field === "phone") localStorage.setItem("checkout_phone", value as string);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleDistanceChange = (newIndex: number) => {
        const path = locale === "en" ? `/en/${event.slug}/checkout?distance=${newIndex}` : `/${event.slug}/checkout?distance=${newIndex}`;
        router.push(path, { scroll: false });
    };

    const handleApplyDiscount = async () => {

        const code = discountCode.trim().toUpperCase();
        if (!code) return;

        setDiscountStatus("checking");
        setDiscountError("");

        try {
            const response = await fetch('/api/checkout/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (!response.ok) {
                setDiscountStatus("error");
                if (data.error === 'INVALID_COUPON') {
                    setDiscountError(t("checkout_discount_invalid"));
                } else if (data.error === 'EXPIRED_COUPON') {
                    setDiscountError(t("checkout_discount_expired"));
                } else {
                    setDiscountError(t("checkout_discount_error"));
                }
                return;
            }

            setDiscountStatus("applied");
            setDiscountData({
                couponId: data.couponId,
                percentOff: data.percentOff,
                code: data.code,
            });
        } catch (error) {
            console.error('Error applying discount:', error);
            setDiscountStatus("error");
            setDiscountError(t("checkout_discount_error"));
        }
    };

    const termsUrl = locale === "en" ? "/en/noteikumi" : "/noteikumi";

    // Show error if price not found
    const showPriceError = !priceLoading && !matchingPrice;

    return (
        <div className="space-y-6">
            {/* Error Banner */}
            {showPriceError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
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
                            Registration is temporarily unavailable. Please contact us at {CONTACT_INFO.email}
                        </p>
                    </div>
                </div>
            )}

            {/* Dorm Full Error Banner */}
            {event.hasAccommodation && dormFullError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm text-amber-700">
                            {t("checkout_error_dorm_full")}
                        </p>
                    </div>
                </div>
            )}

            {/* Generic Server Error Banner */}
            {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
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
                            {t("checkout_error_server")}
                        </p>
                    </div>
                </div>
            )}

            {/* Selection Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                            {t("checkout_selection_label")}
                        </span>
                        <div className="text-right">
                            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-0.5">{t("checkout_price_label")}</span>
                            {priceLoading ? (
                                <span className="text-xl font-semibold text-slate-400">...</span>
                            ) : matchingPrice ? (
                                <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-2xl font-bold text-emerald-400">
                                        €{(finalPrice / 100).toFixed(2)}
                                    </span>
                                    {discountStatus === 'applied' && discountData && (
                                        <span className="text-slate-400 line-through text-base">
                                            €{(originalPrice / 100).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-lg text-red-400">N/A</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Event (Read-only) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            {t("checkout_event_label")}
                        </label>
                        <div data-testid="event-name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                            {eventName}
                        </div>
                    </div>

                    {/* Distance Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            {t("checkout_distance_label")}
                        </label>
                        <div className="relative">
                            <select
                                data-testid="distance-select"
                                value={selectedDistanceIndex.toString()}
                                onChange={(e) => handleDistanceChange(parseInt(e.target.value, 10))}
                                disabled={event.distances.length <= 1}
                                className={`w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium appearance-none hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${event.distances.length <= 1 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            >
                                {event.distances.map((d, idx) => {
                                    const distKm = d.facts.find(f => f.icon === "route")?.value || "";
                                    return (
                                        <option key={idx} value={idx.toString()}>
                                            {distKm || t(d.nameKey as any)}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Route Facts */}
                    {(distanceFact || elevationFact) && (
                        <div className="flex flex-wrap gap-3 pt-1">
                            {distanceFact && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="font-medium">{distanceFact.value}</span>
                                </div>
                            )}
                            {elevationFact && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    <span className="font-medium">{elevationFact.value}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Participant Details Form */}
            <form
                method="POST"
                action="/api/checkout/create-session"
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-slate-300 shadow-2xl p-6 space-y-6 relative z-10"
            >
                {/* Hidden inputs project JS-controlled state into native FormData. */}
                <input type="hidden" name="eventSlug" value={event.slug} />
                <input type="hidden" name="distanceIndex" value={selectedDistanceIndex} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="priceId" value={matchingPrice?.priceId || ""} />
                <input type="hidden" name="phone" value={formData.phone} />
                <input type="hidden" name="needsAccommodation" value={formData.needsAccommodation ? "1" : "0"} />
                <input type="hidden" name="accommodationType" value={formData.accommodationType || ""} />
                <input type="hidden" name="accommodationWaitlist" value={formData.accommodationType === "dorm" && isDormWaitlist ? "1" : "0"} />
                <input type="hidden" name="wantsPreparationTips" value={formData.wantsPreparationTips ? "1" : "0"} />
                <input type="hidden" name="preparationTipsChannel" value={formData.preparationTipsChannels.join(",")} />
                <input type="hidden" name="couponId" value={discountData?.code || ""} />
                <input type="hidden" name="originalPrice" value={originalPrice} />
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        {t("checkout_name_label")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 hover:border-slate-400'}`}
                        placeholder="Jānis Bērziņš"
                    />
                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        {t("checkout_email_label")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 hover:border-slate-400'}`}
                        placeholder="janis@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        {t("checkout_phone_label")} <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                        international
                        defaultCountry="LV"
                        value={formData.phone}
                        onChange={(phone) => handleInputChange("phone", phone || "")}
                        className={`checkout-phone-input ${errors.phone ? 'error' : ''}`}
                    />
                    {errors.phone && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>

                {/* Accommodation Checkbox (only for events with accommodation) */}
                {event.hasAccommodation && (
                <div className="-mt-2 !mb-4">
                    <div className="flex items-start gap-3 py-2">
                        <input
                            type="checkbox"
                            id="needsAccommodation"
                            checked={formData.needsAccommodation}
                            onChange={(e) => {
                                handleInputChange("needsAccommodation", e.target.checked);
                                if (!e.target.checked) {
                                    handleInputChange("accommodationType", "");
                                }
                            }}
                            className="w-5 h-5 mt-0.5 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer"
                        />
                        <label htmlFor="needsAccommodation" className="text-sm text-slate-700 flex-1 cursor-pointer font-medium leading-relaxed">
                            {t("checkout_accommodation_label")}
                        </label>
                    </div>

                    {/* Accommodation Options */}
                    {formData.needsAccommodation && (
                        <div className="ml-8 mt-3 space-y-1">
                            {/* Dorm Option */}
                            <label className="flex items-start gap-3 py-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="accommodationType"
                                    value="dorm"
                                    checked={formData.accommodationType === "dorm"}
                                    onChange={(e) => handleInputChange("accommodationType", e.target.value)}
                                    className="w-4 h-4 mt-0.5 border-slate-300 text-slate-800 focus:ring-slate-800"
                                />
                                <div className="flex-1">
                                    <span className="text-sm text-slate-700 font-medium">
                                        {t("checkout_accommodation_dorm")}
                                    </span>
                                    <span className={`ml-2 text-xs ${isDormWaitlist ? 'text-amber-600' : 'text-slate-500'}`}>
                                        {isDormWaitlist
                                            ? `(${t("checkout_accommodation_waitlist")})`
                                            : `(${t("checkout_accommodation_spots_remaining", { count: dormSpotsRemaining })})`
                                        }
                                    </span>
                                </div>
                            </label>

                            {/* Tent Option */}
                            <label className="flex items-start gap-3 py-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="accommodationType"
                                    value="tent"
                                    checked={formData.accommodationType === "tent"}
                                    onChange={(e) => handleInputChange("accommodationType", e.target.value)}
                                    className="w-4 h-4 mt-0.5 border-slate-300 text-slate-800 focus:ring-slate-800"
                                />
                                <span className="text-sm text-slate-700 font-medium">
                                    {t("checkout_accommodation_tent")}
                                </span>
                            </label>

                            {errors.accommodationType && (
                                <p className="text-sm text-red-600">{errors.accommodationType}</p>
                            )}
                        </div>
                    )}
                </div>
                )}

                {/* Preparation Tips Checkbox */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3 py-2">
                        <input
                            type="checkbox"
                            id="wantsPreparationTips"
                            checked={formData.wantsPreparationTips}
                            onChange={(e) => {
                                handleInputChange("wantsPreparationTips", e.target.checked);
                                if (!e.target.checked) {
                                    handleInputChange("preparationTipsChannel", "");
                                }
                            }}
                            className="w-5 h-5 mt-0.5 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer"
                        />
                        <label htmlFor="wantsPreparationTips" className="text-sm text-slate-700 flex-1 cursor-pointer font-medium leading-relaxed">
                            {t("checkout_tips_label")}
                        </label>
                    </div>

                    {/* Channel Options */}
                    {formData.wantsPreparationTips && (
                        <div className="ml-8 mt-4 space-y-4">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {t("checkout_tips_channel_label")}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {[
                                    { id: 'email', label: 'checkout_tips_channel_email' },
                                    { id: 'website', label: 'checkout_tips_channel_website' },
                                    { id: 'instagram', label: 'checkout_tips_channel_instagram' },
                                    { id: 'youtube', label: 'checkout_tips_channel_youtube' },
                                    { id: 'whatsapp', label: 'checkout_tips_channel_whatsapp' },
                                    { id: 'other', label: 'checkout_tips_channel_other' }
                                ].map((channel) => (
                                    <label key={channel.id} className="flex items-center gap-2 py-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            value={channel.id}
                                            checked={formData.preparationTipsChannels.includes(channel.id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    preparationTipsChannels: checked
                                                        ? [...prev.preparationTipsChannels, channel.id]
                                                        : prev.preparationTipsChannels.filter(id => id !== channel.id)
                                                }));
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                            {t(channel.label as any)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Discount Code Section */}
                <div className="space-y-3">
                    <label htmlFor="discountCode" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {t("checkout_discount_label")}
                    </label>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            id="discountCode"
                            value={discountCode}
                            onChange={(e) => {
                                setDiscountCode(e.target.value.toUpperCase());
                                setDiscountError("");
                            }}
                            disabled={discountStatus === 'applied'}
                            className={`flex-1 px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all ${discountStatus === 'applied' ? 'bg-slate-100 cursor-not-allowed' : 'border-slate-300 hover:border-slate-400'
                                }`}
                            placeholder={t("checkout_discount_placeholder")}
                        />
                        <button
                            type="button"
                            onClick={handleApplyDiscount}
                            disabled={!discountCode || discountStatus === 'checking' || discountStatus === 'applied'}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium rounded-xl transition-all disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {discountStatus === 'checking' ? t("checkout_discount_checking") : t("checkout_discount_apply")}
                        </button>
                    </div>

                    {/* Success Message */}
                    {discountStatus === 'applied' && discountData && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t("checkout_discount_applied", { percent: discountData.percentOff })}
                        </div>
                    )}

                    {/* Error Message */}
                    {discountError && (
                        <p className="text-sm text-red-600">{discountError}</p>
                    )}
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-start gap-3 py-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={formData.acceptTerms}
                        onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 flex-1 cursor-pointer leading-relaxed">
                        {t("checkout_terms_label")}{" "}
                        <Link
                            href={termsUrl}
                            target="_blank"
                            className="text-slate-800 font-semibold hover:text-slate-600 underline underline-offset-2 inline-flex items-center gap-1"
                        >
                            {t("checkout_terms_link")}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                        <span className="text-red-500"> *</span>
                    </label>
                </div>
                {errors.acceptTerms && (
                    <p className="mt-2 text-sm text-red-600 ml-8">{errors.acceptTerms}</p>
                )}

                {/* Nolikums Notice */}
                <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-700">
                        {t("checkout_nolikums_notice")}
                    </p>
                </div>

                {/* Submit Button - sticky on mobile for visibility */}
                <div className="sticky bottom-0 sm:static bg-white/95 backdrop-blur-sm sm:backdrop-blur-none -mx-6 px-6 py-4 sm:py-0 sm:mx-0 sm:px-0 border-t border-slate-100 sm:border-t-0 pb-safe">
                    <button
                        type="submit"
                        disabled={isSubmitting || priceLoading || showPriceError}
                        className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold text-lg rounded-xl transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t("checkout_submit")}
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                {t("checkout_submit")}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
