require('tsconfig-paths');
import { createHandler } from '@catsvsdogs/server/serverless';
import { VoteModule } from '@catsvsdogs/server/vote/vote.module';
import { NetlifyFunction } from '../interface';

let serverless: ReturnType<typeof createHandler>;
function getServerless() {
	if (!serverless) {
		serverless = createHandler(VoteModule, { prefix: '/.netlify/functions' });
	}
	return serverless;
}

export const handler: NetlifyFunction = async function (event, context) {
	return (await getServerless())(event as any, context);
};
