import * as express from "express";
import * as serverless from "serverless-http";
import { Handler } from "serverless-http";
import { CreateAppModuleConfig } from "./app";
import { createNestApp } from "./server";

export interface CreateHandlerConfig extends CreateAppModuleConfig {
	prefix: string;
}

export function createHandler(config: CreateHandlerConfig): Handler {
	async function init() {
		const server = express();
		const app = await createNestApp({
			server,
			...config,
		});
		await app.init();
		return serverless(server);
	}

	const handler = init();

	return async (event, context) => {
		return (await handler)(event, context);
	};
}
