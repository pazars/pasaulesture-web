import { CONTACT_INFO } from "@/app/data/contact";

export default function TermsContentLV() {
    return (
        <div className="prose prose-lg max-w-none text-earth-dark">
            <h2 className="text-2xl font-accent text-forest-deep mt-8 mb-4">
                Distances līgums
            </h2>

            <p>
                Šajā interneta veikalā piedāvāto preču pārdevējs ({CONTACT_INFO.organizationName} Reģ nr. {CONTACT_INFO.registrationNumber}, {CONTACT_INFO.address}, Bankas
                konts: {CONTACT_INFO.bankAccount}, epasts: {CONTACT_INFO.email}) no vienas
                puses, turpmāk saukts Pārdevējs, un persona, kas veic pasūtījumu,
                turpmāk saukta Pircējs, no otras puses, noslēdz šādu Līgumu: Pārdevējs
                apņemas pārdot un piegādāt Pircējam pakalpojumus, atbilstoši Pircēja
                pasūtījumam.
            </p>

            <h3 className="text-xl font-semibold text-forest-deep mt-6 mb-3">
                Pasūtīšanas, piegādes un samaksas kārtība
            </h3>

            <p>
                Pircējs veic pakalpojumu pasūtīšanu caur šo mājas lapu, norādot
                iegādājamo pakalpojumu veidu un daudzumu. Pircējam ir iespēja veikt
                apmaksu par pakalpojumu, lietojot interneta veiklā iestrādātos
                maksājuma rīkus (bankas pārskaitījums, bankas karte, Apple Pay, Google
                Pay).
            </p>

            <p>
                Pārdevējs nodrošina pakalpojuma pieteikuma apstiprinājumu 5 dienu
                laikā, kopš ir saņemta apmaksa par pakalpojumu.
            </p>

            <p>
                Pēc apmaksas veikšanas, pircējs saņem norādītajā epastā maksājuma
                apstiprinājumu un pakalpojuma pieteikuma apstiprinājumu.
            </p>

            <h3 className="text-xl font-semibold text-forest-deep mt-6 mb-3">
                Atteikuma tiesības
            </h3>

            <p>
                Pircējam ir tiesības atteikties no pakalpojuma 10 kalendāro dienu laikā
                no pakaplojuma apstiprinājuma saņemšanas brīža, nosūtot Pārdevējam par
                to atteikuma vēstuli. Atteikuma vēstules veidlapu Pārdevējs nosūta
                Pircējam pa e-pastu pēc Pircēja pieprasījuma.
            </p>

            <p className="font-semibold">Pircējs nevar izmantot atteikuma tiesības, ja:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Pakalpojums ir pēc mazāk kā 14 dienām.</li>
                <li>
                    Ja pircējs atsaka pakalpojumu (dalību pasākumā) mazāk kā 30 kalendāro
                    dienu laikā pirms pasākuma, tad tiek vieta dalības atmaksa 50%
                    apmērā.
                </li>
                <li>
                    Ja pircējs atsaka pakalpojumu (dalību pasākumā) vairāk kā 30
                    kalendāro dienu laikā pirms pasākuma, tad tiek vieta dalības atmaksa
                    100% apmērā.
                </li>
            </ul>

            <p>Atmaksa tiek veikta uz epastā norādīto bankas konta nr.</p>

            <p>Pircējs naudu saņem 10 darba dienu laikā.</p>

            <h3 className="text-xl font-semibold text-forest-deep mt-6 mb-3">
                Sūdzību izskatīšana un ārpustiesas strīda risināšana kārtība
            </h3>

            <p>
                Sūdzību par preču pieejamību vai kvalitāti lūdzam iesniegt elektroniski,
                nosūtot uz elektronisko pasta adresi – {CONTACT_INFO.email} Sūdzība
                tiks izskatīta 7 darba dienu laikā no sūdzības saņemšanas dienās,
                atbildi nosūtot uz sūdzībā norādīto saziņas adresi.
            </p>

            <p>
                Ja sūdzība tiks atzīta par nepamatotu un Jūs sūdzības atzīšanai par
                nepamatotu nepiekritīsiet, Jums ir tiesības izmantot normatīvajos aktos
                noteiktās alternatīvo strīdu risināšanas iespējas, iesniedzot
                pakalpojuma pārdevējam rakstveida iesniegumu par ārpustiesas strīda
                risināšanu, norādot:
            </p>

            <ol className="list-decimal pl-6 space-y-2">
                <li>Vārdu, uzvārdu, kontaktinformāciju;</li>
                <li>Iesnieguma iesniegšanas datumu;</li>
                <li>Strīda būtību, prasījumus un to pamatojumu.</li>
            </ol>

            <p className="font-semibold mt-4">
                Informācija par ārpustiesas strīdu risināšanas iespējām un ārpustiesas
                strīdu risinātājiem:
            </p>

            <ul className="list-none space-y-1">
                <li>
                    <a
                        href="http://www.ptac.gov.lv/lv/content/stridu-risinasanas-process"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest-medium hover:text-amber underline inline-flex items-center gap-1"
                    >
                        http://www.ptac.gov.lv/lv/content/stridu-risinasanas-process
                        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </li>
                <li>
                    <a
                        href="http://www.ptac.gov.lv/lv/content/arpustiesas-pateretaju-stridu-risinataju-datubaze"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest-medium hover:text-amber underline inline-flex items-center gap-1"
                    >
                        http://www.ptac.gov.lv/lv/content/arpustiesas-pateretaju-stridu-risinataju-datubaze
                        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </li>
                <li>
                    <a
                        href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home.chooseLanguage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest-medium hover:text-amber underline inline-flex items-center gap-1"
                    >
                        https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home.chooseLanguage
                        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </li>
            </ul>

            <h3 className="text-xl font-semibold text-forest-deep mt-6 mb-3">
                Datu apstrāde
            </h3>

            <p>
                Ievadot nepieciešamo informāciju, noformējot pasūtījumu, Pircējs
                apliecina, ka ir iepazinies un piekrīt, ka viņa sniegtie dati tiek
                izmantoti, lai Pārdevējs varētu pieņemt Pircēja pasūtījumu un veikt
                pakalpojumu piegādi saskaņā ar normatīvo aktu prasībām. Ievadot
                informāciju, Pircējs piekrīt, ka tam uz norādīto e-pastu tiks izsūtīti
                paziņojumi, kas saistīti ar Pircēja pasūtījuma apstrādi.
            </p>

            <p>
                Ar detalizētu informāciju par personas datu apstrādi Pircējs var
                iepazīties interneta veikala sadaļā{" "}
                <a
                    href="/privatuma-politika"
                    className="text-forest-medium hover:text-amber underline"
                >
                    https://pasaulesture.lv/privatuma-politika
                </a>
            </p>
        </div>
    );
}
