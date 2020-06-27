import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import { createMysqlConfig, createSqljsConfig, createSqljsDiskConfig } from './config';

export type OrmType = 'memory' | 'disk' | 'mysql';

function isOrmType(value: any): value is OrmType {
	return value === 'memory' || value === 'disk' || value == 'mysql';
}

export const ORM_TYPE: OrmType = isOrmType(process.env.ORM_TYPE) ? process.env.ORM_TYPE : 'memory';

export function createOrmConfig(type: OrmType): SqljsConnectionOptions | MysqlConnectionOptions {
	switch (type) {
		case 'memory':
			return createSqljsConfig({});
		case 'disk':
			if (!process.env.SQLJS_LOCATION) {
				throw new Error('missing SQLJS_LOCATION env');
			}
			return createSqljsDiskConfig({
				autoSave: true,
				location: process.env.SQLJS_LOCATION,
			});
		case 'mysql':
			if (!process.env.MYSQL_DATABASE) {
				throw new Error('missing MYSQL_DATABASE env');
			}
			return createMysqlConfig({
				username: process.env.MYSQL_USER ?? '',
				password: process.env.MYSQL_PASSWORD ?? '',
				host: process.env.MYSQL_HOST ?? 'localhost',
				port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : undefined,
				database: process.env.MYSQL_DATABASE,
			});
	}
}

export const ORM_CONFIG = createOrmConfig(ORM_TYPE);
