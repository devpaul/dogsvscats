import { HttpServer, ValidationPipe } from "@nestjs/common";
import { NestApplicationOptions } from "@nestjs/common/interfaces/nest-application-options.interface";
import { FastifyAdapter, NestFactory } from "@nestjs/core";
import * as express from "express";
import { Express } from "express";
import { createAppModule, CreateAppModuleConfig } from "./app";

export interface CreateNestAppConfig extends CreateAppModuleConfig {
	options?: NestApplicationOptions;
	server: HttpServer | FastifyAdapter | Express;
	prefix?: string;
}

export async function createNestApp({
	server,
	options,
	modules,
	prefix = "/api",
	ormOptions,
}: CreateNestAppConfig) {
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
	ormOptions: CreateNestAppConfig["ormOptions"];
}

export async function start({ port, files, ormOptions }: StartConfig) {
	const server = express();
	const app = await createNestApp({
		server,
		ormOptions,
	});
	app.useStaticAssets(files);

	await app.listen(port);
	console.log(`server started on port ${port}`);
}
