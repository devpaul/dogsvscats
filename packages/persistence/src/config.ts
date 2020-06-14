import 'reflect-metadata';
import { ConnectionOptions } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import { UserEntity } from './entity/UserEntity';
import { VoteEntity } from './entity/VoteEntity';

const baseConfig: Pick<ConnectionOptions, 'entities'> = {
	entities: [VoteEntity, UserEntity]
};

export function createSqljsConfig(config: Omit<SqljsConnectionOptions, 'type'> = {}): SqljsConnectionOptions {
	return {
		type: 'sqljs',
		synchronize: true,
		...baseConfig,
		...config
	};
}

type SqljsDiskConfig = Required<Pick<SqljsConnectionOptions, 'location'>> &
	Omit<SqljsConnectionOptions, 'type' | 'location'>;

export function createSqljsDiskConfig(config: SqljsDiskConfig): SqljsConnectionOptions {
	return createSqljsConfig(config);
}

type MysqlConfig = Omit<MysqlConnectionOptions, 'type'> &
	Required<Pick<MysqlConnectionOptions, 'username' | 'password' | 'host' | 'port' | 'database'>>;

export function createMysqlConfig(config: MysqlConfig): MysqlConnectionOptions {
	return {
		type: 'mysql',
		...config
	};
}
