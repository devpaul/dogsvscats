import { BaseConnectionOptions } from 'typeorm/connection/BaseConnectionOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import * as entities from './entity';
import * as migrations from './migration';

export type CreateSqljsConfig = Omit<SqljsConnectionOptions, 'type'>;

export function getBaseOptions(): Pick<BaseConnectionOptions, 'entities' | 'migrations'> {
	return {
		migrations: Object.values(migrations),
		entities: Object.values(entities),
	};
}

export function createSqljsConfig(config: CreateSqljsConfig = {}): SqljsConnectionOptions {
	return {
		type: 'sqljs',
		synchronize: true,
		...getBaseOptions(),
		...config,
	};
}

type SqljsDiskConfig = Required<Pick<SqljsConnectionOptions, 'location'>> &
	Omit<SqljsConnectionOptions, 'type' | 'location'>;

export function createSqljsDiskConfig(config: SqljsDiskConfig): SqljsConnectionOptions {
	return createSqljsConfig(config);
}

type MysqlConfig = Omit<MysqlConnectionOptions, 'type'> &
	Required<Pick<MysqlConnectionOptions, 'username' | 'password' | 'host' | 'database'>>;

export function createMysqlConfig(config: MysqlConfig): MysqlConnectionOptions {
	return {
		type: 'mysql',
		...getBaseOptions(),
		...config,
	};
}
