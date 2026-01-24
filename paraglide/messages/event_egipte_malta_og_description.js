/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_event_egipte_malta_og_description = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`200-370 km gravel piedzīvojums cauri Latvijas mežiem un līdzenumiem. Ultra riteņbraukšanas pasākums ar 35h laika limitu.`)
};

const en_event_egipte_malta_og_description = /** @type {(inputs: {}) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`200-370 km gravel adventure through Latvia's forests and plains. Ultra cycling event with 35h time limit.`)
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
export const event_egipte_malta_og_description = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.event_egipte_malta_og_description(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("event_egipte_malta_og_description", locale)
	if (locale === "lv") return lv_event_egipte_malta_og_description(inputs)
	return en_event_egipte_malta_og_description(inputs)
};