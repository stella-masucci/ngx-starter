import { isString } from 'lodash';

export class StringUtils {

	/**
	 * Returns true if input is a string and it is not empty.
	 */
	public static isNonEmptyString(s: any): boolean {
		return (isString(s) && s.trim().length > 0);
	}

	/**
	 * Returns true if input is not a string or if input is empty
	 *
	 * @param s
	 * @returns {boolean}
	 */
	public static isInvalid(s: any): boolean {
		return !StringUtils.isNonEmptyString(s);
	}

	public static capitalize(s: string): string {
		if (null != s) {
			return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
		}

		return s;
	}

	public static camelToHuman(s: string) {
		if (null == s) {
			return null;
		}
		let result = s.replace( /([A-Z])/g, ' $1' );
		return StringUtils.capitalize(result);
	}

	public static hyphenToHuman(s: string) {
		if (null == s) {
			return null;
		}
		let result = s.replace( /-/g, ' ' );
		return StringUtils.toTitleCase(result);
	}

	public static underscoreToHuman(s: string) {
		if (null == s) {
			return null;
		}
		let result = s.replace( /_/g, ' ' );
		return StringUtils.toTitleCase(result);
	}

	/**
	 * Returns the string with every first letter of each word is upper case and the rest are lower case
	 *
	 * @param s
	 * @returns {string}
	 */
	public static toTitleCase(s: string) {
		if (null == s) {
			return null;
		}

		return s.replace(/\b\w\S*/g, (txt) => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	public static stripPunctuation(s: string) {
		if (null != s) {
			return s.replace(/[\-=_!"#%&'*{},.\/:;?\(\)\[\]@\\$\^*+<>~`\u00a1\u00a7\u00b6\u00b7\u00bf\u037e\u0387\u055a-\u055f\u0589\u05c0\u05c3\u05c6\u05f3\u05f4\u0609\u060a\u060c\u060d\u061b\u061e\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0830-\u083e\u085e\u0964\u0965\u0970\u0af0\u0df4\u0e4f\u0e5a\u0e5b\u0f04-\u0f12\u0f14\u0f85\u0fd0-\u0fd4\u0fd9\u0fda\u104a-\u104f\u10fb\u1360-\u1368\u166d\u166e\u16eb-\u16ed\u1735\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u1805\u1807-\u180a\u1944\u1945\u1a1e\u1a1f\u1aa0-\u1aa6\u1aa8-\u1aad\u1b5a-\u1b60\u1bfc-\u1bff\u1c3b-\u1c3f\u1c7e\u1c7f\u1cc0-\u1cc7\u1cd3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203b-\u203e\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205e\u2cf9-\u2cfc\u2cfe\u2cff\u2d70\u2e00\u2e01\u2e06-\u2e08\u2e0b\u2e0e-\u2e16\u2e18\u2e19\u2e1b\u2e1e\u2e1f\u2e2a-\u2e2e\u2e30-\u2e39\u3001-\u3003\u303d\u30fb\ua4fe\ua4ff\ua60d-\ua60f\ua673\ua67e\ua6f2-\ua6f7\ua874-\ua877\ua8ce\ua8cf\ua8f8-\ua8fa\ua92e\ua92f\ua95f\ua9c1-\ua9cd\ua9de\ua9df\uaa5c-\uaa5f\uaade\uaadf\uaaf0\uaaf1\uabeb\ufe10-\ufe16\ufe19\ufe30\ufe45\ufe46\ufe49-\ufe4c\ufe50-\ufe52\ufe54-\ufe57\ufe5f-\ufe61\ufe68\ufe6a\ufe6b\uff01-\uff03\uff05-\uff07\uff0a\uff0c\uff0e\uff0f\uff1a\uff1b\uff1f\uff20\uff3c\uff61\uff64\uff65]+/gi, '');
		}

		return null;
	}

}
