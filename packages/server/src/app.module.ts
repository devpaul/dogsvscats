import { createSqljsConfig } from '@catsvsdogs/persistence/src/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteModule } from './vote/vote.module';

@Module({
	imports: [TypeOrmModule.forRoot(createSqljsConfig()), VoteModule]
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
