import React from "react";
import * as icons from "@mdi/js";

export const Icon: React.FC<{ name: keyof typeof icons; className?: string; style?: Partial<CSSStyleDeclaration>; size?: string | number }> = ({ name, className, size = 25 }) => {
	size = typeof size === "number" ? `${size}px` : size;

	return React.createElement(
		"svg",
		{ className, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: size, height: size, fill: "currentColor" },
		React.createElement("title", {}, [name]),
		React.createElement("path", { d: icons[name] }),
	);
};
