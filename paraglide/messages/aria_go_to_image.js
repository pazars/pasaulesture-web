/* eslint-disable */
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';
/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

const lv_aria_go_to_image = /** @type {(inputs: { number: NonNullable<unknown> }) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Iet uz attēlu ${i?.number}`)
};

const en_aria_go_to_image = /** @type {(inputs: { number: NonNullable<unknown> }) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Go to image ${i?.number}`)
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ number: NonNullable<unknown> }} inputs
* @param {{ locale?: "lv" | "en" }} options
* @returns {LocalizedString}
*/
/* @__NO_SIDE_EFFECTS__ */
export const aria_go_to_image = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.aria_go_to_image(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("aria_go_to_image", locale)
	if (locale === "lv") return lv_aria_go_to_image(inputs)
	return en_aria_go_to_image(inputs)
};