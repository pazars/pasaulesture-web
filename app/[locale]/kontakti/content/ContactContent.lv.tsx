import { CONTACT_INFO } from "@/app/data/contact";

export default function ContactContentLv() {
  return (
    <div className="prose prose-lg max-w-none text-gray-700">
      <section className="mb-10">
        <div className="bg-cream rounded-2xl p-8 border border-sand/30 shadow-sm">
          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-forest-deep/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-forest-deep"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone uppercase tracking-wider mb-1">
                  E-pasts
                </h3>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-lg font-semibold text-forest-deep hover:text-amber transition-colors"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>

            {/* Registration Number */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-forest-deep/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-forest-deep"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone uppercase tracking-wider mb-1">
                  Reģistrācijas numurs
                </h3>
                <p className="text-lg font-semibold text-forest-deep">
                  {CONTACT_INFO.registrationNumber}
                </p>
              </div>
            </div>

            {/* Legal Name */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-forest-deep/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-forest-deep"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone uppercase tracking-wider mb-1">
                  Juridiskais nosaukums
                </h3>
                <p className="text-lg font-semibold text-forest-deep">
                  {CONTACT_INFO.organizationName}
                </p>
              </div>
            </div>

            {/* Bank Account */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-forest-deep/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-forest-deep"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone uppercase tracking-wider mb-1">
                  Bankas konts
                </h3>
                <p className="text-lg font-semibold text-forest-deep font-mono">
                  {CONTACT_INFO.bankAccount}
                </p>
              </div>
            </div>

            {/* Phone Note */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone uppercase tracking-wider mb-1">
                  Tālrunis
                </h3>
                <p className="text-base text-stone italic">
                  Biedrībai nav kontakttālruņa. Lūdzu, sazinieties ar mums pa e-pastu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
