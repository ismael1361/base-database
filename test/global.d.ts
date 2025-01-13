interface DatabaseTyping {
	"[DEFAULT]": {
		myTable: {
			name: string;
			createdAt: Date;
			gender: "Female" | "Male" | "Other";
			amount: number;
		};
	};
}
