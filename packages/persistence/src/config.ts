import { EntitySchema } from "typeorm";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { SqljsConnectionOptions } from "typeorm/driver/sqljs/SqljsConnectionOptions";
import { UserEntity } from "./entity/UserEntity";
import { VoteEntity } from "./entity/VoteEntity";

export type CreateSqljsConfig = Omit<SqljsConnectionOptions, "type">;

export function getEntities(): (EntitySchema<any> | Function)[] {
	return [VoteEntity, UserEntity];
}

export function createSqljsConfig(
	config: CreateSqljsConfig = {}
): SqljsConnectionOptions {
	return {
		type: "sqljs",
		synchronize: true,
		entities: getEntities(),
		...config,
	};
}

type SqljsDiskConfig = Required<Pick<SqljsConnectionOptions, "location">> &
	Omit<SqljsConnectionOptions, "type" | "location">;

export function createSqljsDiskConfig(
	config: SqljsDiskConfig
): SqljsConnectionOptions {
	return createSqljsConfig(config);
}

type MysqlConfig = Omit<MysqlConnectionOptions, "type"> &
	Required<
		Pick<
			MysqlConnectionOptions,
			"username" | "password" | "host" | "database"
		>
	>;

export function createMysqlConfig(config: MysqlConfig): MysqlConnectionOptions {
	return {
		type: "mysql",
		entities: getEntities(),
		...config,
	};
}
