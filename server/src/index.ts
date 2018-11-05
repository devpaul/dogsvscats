import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

const PORT = 3000;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useStaticAssets(join(__dirname, '../..', 'client', 'output', 'dev'));

	await app.listen(PORT);
	console.log(`server started on port ${PORT}`);
}
bootstrap();
