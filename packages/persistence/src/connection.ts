import { createConnection } from 'typeorm';
import { createMysqlConfig, createSqljsConfig, createSqljsDiskConfig } from './config';

export function sqljs(config: Parameters<typeof createSqljsConfig>[0] = {}) {
	return createConnection(createSqljsConfig(config));
}

export function sqljsDisk(config: Parameters<typeof createSqljsDiskConfig>[0]) {
	return createConnection(createSqljsDiskConfig(config));
}

export function mysql(config: Parameters<typeof createMysqlConfig>[0]) {
	return createConnection(createMysqlConfig(config));
}
