import type { DatabaseSettings } from "./types";

export const default_model: DatabaseSettings[string] = {
	tables: {
		users: {
			id: {
				type: "INTEGER",
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: "TEXT",
				notNull: true,
				unique: true,
			},
			email: {
				type: "TEXT",
				notNull: true,
				unique: true,
			},
			createdAt: {
				type: "DATETIME",
				notNull: true,
				default: "CURRENT_TIMESTAMP",
			},
		},
	},
	storage: {
		type: "sqlite",
		config: { local: "{{ROOTDIR}}/demo.db" },
	},
};

export const auth_model: DatabaseSettings[string] = {
	tables: {
		users: {
			id: {
				type: "INTEGER",
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: "TEXT",
				notNull: true,
				unique: true,
			},
			password: {
				type: "TEXT",
				notNull: true,
			},
			email: {
				type: "TEXT",
				notNull: true,
				unique: true,
			},
			createdAt: {
				type: "DATETIME",
				notNull: true,
				default: "CURRENT_TIMESTAMP",
			},
		},
	},
	storage: {
		type: "sqlite",
		config: { local: "{{ROOTDIR}}/AUTH.db" },
	},
};
