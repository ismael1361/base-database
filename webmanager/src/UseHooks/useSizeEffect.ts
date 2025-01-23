import { useCallback, useEffect, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

export const useSizeEffect = <T extends HTMLElement = any>(
	ref: React.MutableRefObject<T | null>,
	callback: (size: { width: number; height: number }) => ReturnType<React.EffectCallback>,
	deps: React.DependencyList = [],
) => {
	const handleCallback = useCallbackRef(callback);
	const elementRef = useRef<T | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const timeRef = useRef<NodeJS.Timeout>();
	const destructorRef = useRef<ReturnType<React.EffectCallback>>();

	const setSize = useCallback((s: { width: number; height: number }) => {
		clearTimeout(timeRef.current);
		timeRef.current = setTimeout(() => {
			destructorRef.current?.();
			destructorRef.current = undefined;
			destructorRef.current = handleCallback(s);
		}, 100);
	}, []);

	const runRef = useCallback((element: T | null) => {
		elementRef.current = element ?? null;

		if (resizeObserverRef.current) {
			resizeObserverRef.current.disconnect();
			resizeObserverRef.current = null;
		}

		if (!element) {
			return;
		}

		const { width, height } = element.getBoundingClientRect();
		setSize({ width, height });

		const resizeObserver = (resizeObserverRef.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setSize({ width, height });
			}
		}));

		resizeObserver.observe(element);
	}, []);

	useEffect(() => {
		runRef(ref.current);
		return () => {
			destructorRef.current?.();
			destructorRef.current = undefined;
		};
	}, [ref, ...deps]);
};
