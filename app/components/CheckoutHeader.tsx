"use client";

import { Suspense } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function CheckoutHeader() {
    return (
        <header className="bg-transparent py-5">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-center">
                    {/* Language switcher only */}
                    <Suspense fallback={<div className="w-20 h-10" />}>
                        <LanguageSwitcher />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
