import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

const PORT = 3000;
const source = process.env.NODE_ENV === 'dev' ? 'dev' : 'dist';
const staticFiles = join(__dirname, '../..', 'client', 'output', source);

async function bootstrap() {
	const server = express();
	const app = await NestFactory.create(AppModule, server);
	app.setGlobalPrefix('/api');
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.enableCors();
	app.useStaticAssets(staticFiles);

	await app.listen(PORT);
	console.log(`serving files from ${staticFiles}`);
	console.log(`server started on port ${PORT}`);
}
bootstrap();
