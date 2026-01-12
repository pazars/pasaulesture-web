/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_page_privacy_title = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Privātuma politika`)
};

const en_page_privacy_title = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Privacy Policy`)
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
export const page_privacy_title = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.page_privacy_title(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("page_privacy_title", locale)
	if (locale === "lv") return lv_page_privacy_title(inputs)
	return en_page_privacy_title(inputs)
};