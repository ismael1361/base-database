export interface DatabaseSettings {
	[db: string]: {
		tables: {
			[table: string]: {
				[column: string]: {
					type: "TEXT" | "INTEGER" | "FLOAT" | "BOOLEAN" | "DATETIME" | "BIGINT" | "NULL";
					primaryKey?: true | false;
					autoIncrement?: true | false;
					notNull?: true | false;
					default?: string | number | boolean | null;
					unique?: true | false;
					options?: string[];
				};
			};
		};
		storage: {
			type: "sqlite" | "mysql" | "postgres";
			config?: any;
		};
	};
}
