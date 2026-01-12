"use client";

import LanguageSwitcher from "./LanguageSwitcher";

export default function CheckoutHeader() {
    return (
        <header className="bg-transparent py-5">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-center">
                    {/* Language switcher only */}
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
