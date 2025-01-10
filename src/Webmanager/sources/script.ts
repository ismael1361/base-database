/// <reference lib="dom" />
/// <reference types="./types/react"/>
/// <reference types="./types/react-dom"/>

const icons = {
	"plus": "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
	"delete": "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
	"square-edit-outline":
		"M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z",
	"close": "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
} as const;

const Icon: React.FC<{ name: keyof typeof icons; className?: string; style?: Partial<CSSStyleDeclaration>; size?: string | number }> = ({ name, className, size = 25 }) => {
	size = typeof size === "number" ? `${size}px` : size;

	return React.createElement(
		"svg",
		{ className, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: size, height: size, fill: "currentColor" },
		React.createElement("title", {}, [name]),
		React.createElement("path", { d: icons[name] }),
	);
};

const GridHeader: React.FC<{ isEditing: boolean; selected: boolean }> = ({ isEditing, selected }) => {
	return React.createElement(
		React.Fragment,
		{},
		React.createElement(
			"div",
			{ className: "grid-toolbar" },
			React.createElement("button", {}, React.createElement(Icon, { name: "plus" }), "Add"),
			React.createElement("button", { disabled: !selected }, React.createElement(Icon, { name: "delete" }), "Delete"),
			React.createElement("button", { disabled: !isEditing }, React.createElement(Icon, { name: "square-edit-outline" }), "Update"),
			React.createElement("button", { disabled: !isEditing }, React.createElement(Icon, { name: "close" }), "Cancel"),
		),
		React.createElement("thead", { className: "grid-columns" }),
	);
};

const GridComponent: React.FC<{ pageCount?: number; allowSorting?: boolean }> = ({}) => {
	const [isEditing, setIsEditing] = React.useState<boolean>(false);
	const [selected, setSelected] = React.useState<string | null>(null);

	return React.createElement("table", { className: "grid-root" }, React.createElement(GridHeader, { isEditing, selected: selected !== null }));
};

const root = document.getElementById("root");
ReactDOM.render(React.createElement(GridComponent, {}), root);
