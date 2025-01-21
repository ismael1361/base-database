import React from "react";
import { cloneObjectLiteral, isObjectLiteral, isObjectIdentical } from "Utils";

type CommitItem = {
	path: PropertyKey[];
	past: any;
	next: any;
};

const getCommit = <T extends object = any>(previous: T, next: T): CommitItem[] => {
	const changes: CommitItem[] = [];

	const allKeys = new Set<PropertyKey>([...Object.keys(previous), ...Object.keys(next)]);

	allKeys.forEach((key) => {
		const p = (previous as any)[key];
		const n = (next as any)[key];

		if (p !== n) {
			if (isObjectLiteral(p) && isObjectLiteral(n)) {
				changes.push(...getCommit(p, n).map((c) => ({ path: [key, ...c.path], past: c.past, next: c.next })));
			} else {
				changes.push({ path: [key], past: p, next: n });
			}
		}
	});

	return changes;
};

const parseCommit = <T extends object = any>(type: "past" | "next", present: T, commit: CommitItem[]): T => {
	commit.forEach(({ path, past, next }) => {
		let obj = present;
		for (let i = 0; i < path.length - 1; i++) {
			obj = (obj as any)[path[i]];
		}

		(obj as any)[path[path.length - 1]] = type === "past" ? past : next;
	});
	return present;
};

const initialStateHistory: { time: number; value: any; cloneValue: any; past: Array<CommitItem[]>; present: CommitItem[]; future: Array<CommitItem[]> } = {
	time: 0,
	cloneValue: null,
	value: null,
	past: [],
	present: [],
	future: [],
};

/**
 * Função de redutor para gerenciar o histórico do estado.
 *
 * @template T
 * @param {Object} state - O estado atual, incluindo o histórico passado, presente e futuro.
 * @param {string} action.type - O tipo de ação a ser executada ("UNDO", "REDO", "SET" ou "CLEAR").
 * @param {T} action.newPresent - O novo estado a ser definido.
 * @param {T} action.initialPresent - O estado inicial quando "CLEAR" é acionado.
 * @returns {Object} O novo estado após a ação ser aplicada.
 */
const reducerHistory = <T extends object = any>(state: typeof initialStateHistory, action: { type: "UNDO" | "REDO" | "SET" | "CLEAR"; newState?: T; initialState?: T }) => {
	const { time, value, cloneValue, past, present, future } = state;
	let newValue;

	switch (action.type) {
		case "UNDO":
			if (past.length === 0) {
				return state;
			}

			const previous = past[past.length - 1] ?? [];
			const newPast = past.slice(0, past.length - 1);
			newValue = parseCommit("past", cloneValue, present);

			return {
				time: Date.now(),
				value: newValue,
				cloneValue: cloneObjectLiteral(newValue),
				past: newPast,
				present: previous,
				future: [present, ...future],
			};
		case "REDO":
			if (future.length === 0) {
				return state;
			}

			const next = future[0] ?? [];
			const newFuture = future.slice(1);
			newValue = parseCommit("next", cloneValue, next);

			return {
				time: Date.now(),
				value: newValue,
				cloneValue: cloneObjectLiteral(newValue),
				past: [...past, present],
				present: next,
				future: newFuture,
			};
		case "SET":
			const { newState = value } = action;

			if (isObjectIdentical(newState, cloneValue)) {
				return state;
			}

			const commit = getCommit(cloneValue, newState);

			if (commit.length <= 0) {
				return state;
			}

			if (
				Date.now() - time < 2000 &&
				commit.length === 1 &&
				present.length === 1 &&
				commit[0].path.join("_") === present[0].path.join("_") &&
				typeof commit[0].next === typeof present[0].next &&
				["number", "string"].includes(typeof commit[0].next)
			) {
				commit[0].past = present[0].past;
			} else {
				past.push(present);
			}

			return {
				time: Date.now(),
				value: newState,
				cloneValue: cloneObjectLiteral(newState),
				past,
				present: commit,
				future: [],
			};
		case "CLEAR":
			const { initialState } = action;

			return {
				...initialStateHistory,
				value: initialState,
				cloneValue: cloneObjectLiteral(initialState!),
			};
	}
};

/**
 * Hook personalizado para gerenciar o histórico de estados.
 *
 * @template T
 * @param {T} initialState - O valor inicial do histórico.
 * @returns {{
 *   state: T,
 *   set: (newPresent: T) => void,
 *   undo: () => void,
 *   redo: () => void,
 *   clear: () => void
 * }} Retorna o estado atual do valor do histórico e callbacks de navegação.
 *
 * @example
 * const { state, set, undo, redo, clear, canUndo, canRedo } = useHistory(initialValue);
 */
export const useHistory = <T extends object = any>(initialState: T) => {
	const [state, dispatch] = React.useReducer(reducerHistory, {
		...initialStateHistory,
		value: cloneObjectLiteral(initialState),
		cloneValue: cloneObjectLiteral(initialState),
	});
	const timeRef = React.useRef<NodeJS.Timeout>();

	// Setup our callback functions
	// We memoize with useCallback to prevent unnecessary re-renders
	const undo = React.useCallback(() => {
		dispatch({ type: "UNDO" });
	}, [dispatch]);

	const redo = React.useCallback(() => {
		dispatch({ type: "REDO" });
	}, [dispatch]);

	const set = React.useCallback(
		(newState: T) => {
			clearTimeout(timeRef.current);
			timeRef.current = setTimeout(() => {
				dispatch({ type: "SET", newState });
			}, 100);
		},
		[dispatch],
	);

	const clear = React.useCallback(() => {
		dispatch({ type: "CLEAR", initialState: cloneObjectLiteral(initialState) });
	}, [dispatch]);

	// If needed we could also return past and future state
	return { state: state.value as T, set, undo, redo, clear };
};
