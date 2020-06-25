import {
	createMysqlConfig,
	createSqljsConfig,
	createSqljsDiskConfig,
} from "@catsvsdogs/persistence/config";
import { join } from "path";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { SqljsConnectionOptions } from "typeorm/driver/sqljs/SqljsConnectionOptions";

export const START_SERVER = process.env.START_SERVER === "false" ? false : true;

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const ENV =
	process.env.NODE_ENV === "development" ? "development" : "production";

export const STATIC_FILES = join(
	__dirname,
	"..",
	"..",
	"client",
	"output",
	ENV === "development" ? "dev" : "dist"
);

export type OrmType = "memory" | "disk" | "mysql";

function isOrmType(value: any): value is OrmType {
	return value === "memory" || value === "disk" || value == "mysql";
}

export const ORM_TYPE: OrmType = isOrmType(process.env.ORM_TYPE)
	? process.env.ORM_TYPE
	: "memory";

function createOrmConfig(
	type: OrmType
): SqljsConnectionOptions | MysqlConnectionOptions {
	switch (type) {
		case "memory":
			return createSqljsConfig({});
		case "disk":
			return createSqljsDiskConfig({
				autoSave: true,
				location: process.env.SQLJS_LOCATION ?? "./catsvsdogs",
			});
		case "mysql":
			return createMysqlConfig({
				username: process.env.MYSQL_USER ?? "",
				password: process.env.MYSQL_PASSWORD ?? "",
				host: process.env.MYSQL_HOST ?? "localhost",
				port: process.env.MYSQL_PORT
					? parseInt(process.env.MYSQL_PORT)
					: undefined,
				database: process.env.MYSQL_DATABASE ?? "catsvsdogs",
			});
	}
}

export const ORM_CONFIG = createOrmConfig(ORM_TYPE);
