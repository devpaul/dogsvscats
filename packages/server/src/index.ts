import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';

const PORT = 3000;
const source = process.env.NODE_ENV === 'dev' ? 'dev' : 'dist';
const staticFiles = join(__dirname, '../..', 'client', 'output', source);

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.enableCors();
	app.useStaticAssets(staticFiles);

	await app.listen(PORT);
	console.log(`serving files from ${staticFiles}`);
	console.log(`server started on port ${PORT}`);
}
bootstrap();
