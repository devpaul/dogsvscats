import { Connection } from 'typeorm';

export async function hasPendingMigrations(connection: Connection | Promise<Connection>) {
	return (await connection).showMigrations();
}

export async function runMigrations(connection: Connection | Promise<Connection>) {
	connection = await connection;
	await connection.runMigrations({
		transaction: 'none',
	});

	await connection.close();
}
