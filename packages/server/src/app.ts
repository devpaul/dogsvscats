import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { VoteModule } from "./vote/vote.module";

export interface Module {
	new (...args: any[]): any;
}

export interface CreateAppModuleConfig {
	modules?: Module[];
	ormOptions: TypeOrmModuleOptions;
}

export function createAppModule({
	modules = [VoteModule],
	ormOptions,
}: CreateAppModuleConfig): any {
	const imports = [TypeOrmModule.forRoot(ormOptions), ...modules];

	@Module({
		imports,
	})
	class AppModule implements NestModule {
		configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
			consumer
				.apply((req: any, _res: any, next: () => {}) => {
					console.log(`[${new Date()}] [${req.method}]: ${req.url}`);
					next();
				})
				.forRoutes("api");
		}
	}

	return AppModule;
}
