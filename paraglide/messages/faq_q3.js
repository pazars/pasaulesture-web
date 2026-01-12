/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_faq_q3 = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kā es varu reģistrēties?`)
};

const en_faq_q3 = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How can I register?`)
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
export const faq_q3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.faq_q3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("faq_q3", locale)
	if (locale === "lv") return lv_faq_q3(inputs)
	return en_faq_q3(inputs)
};