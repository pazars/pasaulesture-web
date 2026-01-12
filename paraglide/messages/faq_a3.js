/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_faq_a3 = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reģistrācija notiek tiešsaistē, noklikšķinot uz 'Reģistrēties' pogas pasākuma lapā. Pēc maksājuma saņemšanas jūs saņemsiet apstiprinājuma e-pastu.`)
};

const en_faq_a3 = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registration takes place online by clicking the 'Register' button on the event page. After payment is received, you will receive a confirmation email.`)
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{}} inputs
* @param {{ locale?: "lv" | "en" }} options
* @returns {LocalizedString}
*/
/* @__NO_SIDE_EFFECTS__ */
export const faq_a3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.faq_a3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("faq_a3", locale)
	if (locale === "lv") return lv_faq_a3(inputs)
	return en_faq_a3(inputs)
};