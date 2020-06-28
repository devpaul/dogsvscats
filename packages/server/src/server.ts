import { createConnection } from '@catsvsdogs/persistence/connection';
import { runMigrations } from '@catsvsdogs/persistence/migrations';
import { HttpServer, ValidationPipe } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { FastifyAdapter, NestFactory } from '@nestjs/core';
import * as express from 'express';
import { Express } from 'express';
import * as isPortReachable from 'is-port-reachable';
import { ConnectionOptions } from 'typeorm';
import { createAppModule, CreateAppModuleConfig } from './app';

export interface CreateNestAppConfig extends CreateAppModuleConfig {
	options?: NestApplicationOptions;
	server: HttpServer | FastifyAdapter | Express;
	prefix?: string;
}

export async function createNestApp({ server, options, modules, prefix = '/api', ormOptions }: CreateNestAppConfig) {
	const AppModule = createAppModule({ modules, ormOptions });
	const app = await NestFactory.create(AppModule, server, options);
	app.setGlobalPrefix(prefix);
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.enableCors();
	return app;
}

export interface StartConfig {
	port: number;
	files: string;
	ormOptions: CreateNestAppConfig['ormOptions'] & ConnectionOptions;
}

export async function start({ port, files, ormOptions }: StartConfig) {
	if (ormOptions.type === 'mysql') {
		const port = ormOptions.port ?? 3306;
		const host = ormOptions.host ?? 'localhost';
		console.log(`waiting for ${host}:${port}`);
		await isPortReachable(port, { host, timeout: 30 * 1000 });
	}

	console.log('running migrations');
	const connection = await createConnection(ormOptions);
	await runMigrations(connection);

	console.log('starting server');
	const server = express();
	const app = await createNestApp({
		server,
		ormOptions,
	});
	app.useStaticAssets(files);

	await app.listen(port);
	console.log(`server started on port ${port}`);
}
