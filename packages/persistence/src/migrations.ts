import { createConnection } from 'typeorm';
import { ORM_CONFIG } from './env';

export async function runMigrations() {
	const connection = await createConnection({ ...ORM_CONFIG, logging: true });

	await connection.runMigrations({
		transaction: 'none',
	});

	await connection.close();
}
