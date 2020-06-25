import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as serverless from 'serverless-http';
import { Handler } from 'serverless-http';

export interface Config {
	prefix: string;
}

export async function createHandler(Module: any, { prefix }: Config): Promise<Handler> {
	const app = express();
	const nest = await NestFactory.create(Module, app);
	nest.setGlobalPrefix(prefix);
	nest.useGlobalPipes(new ValidationPipe({ transform: true }));
	nest.enableCors();

	await nest.init();

	const handler = serverless(app);
	return handler;
}
