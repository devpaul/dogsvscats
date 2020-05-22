import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
		consumer
			.apply((req: any, _res: any, next: () => {}) => {
				console.log(`[${new Date()}] [${req.method}]: ${req.url}`);
				next();
			})
			.forRoutes('api');
	}
}
