/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_faq_a5 = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ja neiekļaujaties laika limitā, jūs varat turpināt maršrutu un tiksiet ieskaitīts pie finišētājiem. Vienīgi finiša zīmodziņu būs jānoorganizē atsevišķi pēc sacensībām.`)
};

const en_faq_a5 = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you don't make the time limit, you can continue the route and will be counted among the finishers. However, you'll need to organize the finish badge separately after the event.`)
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
export const faq_a5 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.faq_a5(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("faq_a5", locale)
	if (locale === "lv") return lv_faq_a5(inputs)
	return en_faq_a5(inputs)
};