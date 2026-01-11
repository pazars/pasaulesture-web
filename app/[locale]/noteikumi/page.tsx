import * as m from "@/paraglide/messages";
import { locales } from "@/paraglide/runtime";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{m.page_terms_title()}</h1>
        <p className="text-gray-600">{m.page_terms_content()}</p>
      </div>
    </div>
  );
}
