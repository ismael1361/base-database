declare const icons: {
    readonly plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
    readonly delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z";
    readonly "square-edit-outline": "M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z";
    readonly close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
};
declare const Icon: React.FC<{
    name: keyof typeof icons;
    className?: string;
    style?: Partial<CSSStyleDeclaration>;
    size?: string | number;
}>;
declare const GridHeader: React.FC<{
    isEditing: boolean;
    selected: boolean;
}>;
declare const GridComponent: React.FC<{
    pageCount?: number;
    allowSorting?: boolean;
}>;
declare const root: HTMLElement | null;
//# sourceMappingURL=script.d.ts.map