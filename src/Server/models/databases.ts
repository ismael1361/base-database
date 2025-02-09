import type { DatabaseSettings } from "../types";

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
		security: {
			id: {
				type: "INTEGER",
				primaryKey: true,
				autoIncrement: true,
			},
			token_salt: {
				type: "TEXT",
			},
		},
		accounts: {
			id: {
				type: "TEXT",
				notNull: true,
				unique: true,
				default: "UUID",
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
			email_verified: {
				type: "BOOLEAN",
				notNull: true,
				default: false,
			},
			display_name: {
				type: "TEXT",
				notNull: true,
				default: "User",
			},
			password: {
				type: "TEXT",
				notNull: true,
			},
			password_salt: {
				type: "TEXT",
				notNull: true,
			},
			created: {
				type: "DATETIME",
				notNull: true,
				default: "CURRENT_TIMESTAMP",
			},
			access_token: {
				type: "TEXT",
				notNull: true,
				unique: true,
			},
			access_token_created: {
				type: "DATETIME",
				notNull: true,
				default: "CURRENT_TIMESTAMP",
			},
			last_signin: {
				type: "DATETIME",
			},
			last_signin_ip: {
				type: "TEXT",
			},
			last_signout: {
				type: "DATETIME",
			},
			last_signout_ip: {
				type: "TEXT",
			},
			prev_signin: {
				type: "DATETIME",
			},
			prev_signin_ip: {
				type: "TEXT",
			},
		},
	},
	storage: {
		type: "sqlite",
		config: { local: "{{ROOTDIR}}/AUTH.db" },
	},
};
