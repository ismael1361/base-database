export * from "./AutoTypings";

export const columnIndexToLabel = (column: number): string => {
	let label = "";
	let index = column;
	while (index >= 0) {
		label = String.fromCharCode(65 + (index % 26)) + label;
		index = Math.floor(index / 26) - 1;
	}
	return label;
};

export const clsx = (...classes: (string | undefined | null | false | Record<PropertyKey, string | undefined | null | false>)[]): string =>
	classes
		.map((c) => {
			if (typeof c === "object" && c !== null) {
				return Object.entries(c)
					.map(([key, value]) => value && key)
					.filter(Boolean)
					.join(" ");
			}
			return c;
		})
		.filter(Boolean)
		.join(" ");

export const getOffsetRect = (element: HTMLElement) => {
	const { width, height, top, left } = element.getBoundingClientRect();
	return {
		width,
		height,
		left,
		top,
	};
};

export const isObjectLiteral = (value: any): value is Record<PropertyKey, any> => value !== null && typeof value === "object" && (value.constructor === Object || value.constructor === Array);

export const isObjectIdentical = (a: any, b: any): boolean => {
	if (!isObjectLiteral(a) && !isObjectLiteral(b)) {
		try {
			return a.toString() === b.toString();
		} catch {
			return false;
		}
	}
	if (a === b) return true;
	if (!isObjectLiteral(a) || !isObjectLiteral(b)) return false;
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	if (keysA.length !== keysB.length) return false;
	for (const key of keysA) {
		if (!keysB.includes(key) || !isObjectIdentical(a[key], b[key])) return false;
	}
	return true;
};

export const cloneObjectLiteral = <T>(obj: T): T => {
	if (!isObjectLiteral(obj)) return obj;
	const clone = (Array.isArray(obj) ? [] : {}) as T;
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			(clone as any)[key] = cloneObjectLiteral((obj as any)[key]);
		}
	}
	return clone;
};
