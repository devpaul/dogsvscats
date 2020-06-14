import 'reflect-metadata';
import { ConnectionOptions, createConnection } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import { UserEntity } from './entity/UserEntity';
import { VoteEntity } from './entity/VoteEntity';

const baseConfig: Pick<ConnectionOptions, 'entities'> = {
	entities: [VoteEntity, UserEntity]
};

export function sqljs(config: Omit<SqljsConnectionOptions, 'type'> = {}) {
	return createConnection({
		type: 'sqljs',
		synchronize: true,
		...baseConfig,
		...config
	});
}

type SqljsDiskConfig = Required<Pick<SqljsConnectionOptions, 'location'>> &
	Omit<SqljsConnectionOptions, 'type' | 'location'>;

export function sqljsDisk(config: SqljsDiskConfig) {
	return sqljs(config);
}

type MysqlConfig = Omit<MysqlConnectionOptions, 'type'> &
	Required<Pick<MysqlConnectionOptions, 'username' | 'password' | 'host' | 'port' | 'database'>>;

export function mysql(config: MysqlConfig) {
	return createConnection({
		type: 'mysql',
		...config
	});
}
