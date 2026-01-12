/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_event_parize_dakara = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Parīze-Dakāra`)
};

const en_event_parize_dakara = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Paris-Dakar`)
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
export const event_parize_dakara = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.event_parize_dakara(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("event_parize_dakara", locale)
	if (locale === "lv") return lv_event_parize_dakara(inputs)
	return en_event_parize_dakara(inputs)
};