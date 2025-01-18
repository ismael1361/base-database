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
