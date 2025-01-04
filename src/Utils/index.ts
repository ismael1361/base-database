export const isObject = (thing: unknown): thing is object => {
	return thing !== null && typeof thing === "object";
};

export const deepEqual = (a: object, b: object): boolean => {
	if (a === b) {
		return true;
	}

	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	for (const k of aKeys) {
		if (!bKeys.includes(k)) {
			return false;
		}

		const aProp = (a as Record<string, unknown>)[k];
		const bProp = (b as Record<string, unknown>)[k];
		if (isObject(aProp) && isObject(bProp)) {
			if (!deepEqual(aProp, bProp)) {
				return false;
			}
		} else if (aProp !== bProp) {
			return false;
		}
	}

	for (const k of bKeys) {
		if (!aKeys.includes(k)) {
			return false;
		}
	}
	return true;
};
