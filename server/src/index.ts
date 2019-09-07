import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

const PORT = 3000;
const source = process.env.NODE_ENV === 'dev' ? 'dev' : 'dist'

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.useStaticAssets(join(__dirname, '../..', 'client', 'output', source));

	await app.listen(PORT);
	console.log(`server started on port ${PORT}`);
}
bootstrap();
