import React, { useEffect, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

export const useDebouncedEffect = (effect: React.EffectCallback, delay: number, deps?: React.DependencyList) => {
	const handleCallback = useCallbackRef(effect);
	const destructorRef = useRef<ReturnType<React.EffectCallback>>();

	useEffect(() => {
		const time = setTimeout(() => {
			destructorRef.current = handleCallback();
		}, delay);

		return () => {
			destructorRef.current?.();
			destructorRef.current = undefined;
			clearTimeout(time);
		};
	}, deps);
};
