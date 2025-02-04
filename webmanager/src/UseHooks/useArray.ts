import { useCallback, useState } from "react";

export const useArray = <T>(initialArray: T[] = []) => {
	const [array, setArray] = useState<T[]>(initialArray);

	const clear = useCallback(() => {
		setArray(() => []);
	}, []);

	const push = useCallback((element: T) => {
		setArray((a) => [...a, element]);
	}, []);

	const pop = useCallback(() => {
		setArray((a) => {
			const b = [...a];
			b.pop();
			return b;
		});
	}, []);

	const unshift = useCallback((element: T) => {
		setArray((a) => [element, ...a]);
	}, []);

	const shift = useCallback(() => {
		setArray((a) => {
			const b = [...a];
			b.shift();
			return b;
		});
	}, []);

	const remove = useCallback((index: number) => {
		setArray((a) => a.filter((_, i) => i !== index));
	}, []);

	const filter = useCallback((callback: (value: T, index: number, array: T[]) => boolean) => {
		setArray((a) => a.filter(callback));
	}, []);

	const sort = useCallback((compareFn?: (a: T, b: T) => number) => {
		setArray((a) => a.sort(compareFn));
	}, []);

	return [array, { clear, push, pop, unshift, shift, remove, filter, sort }] as const;
};
