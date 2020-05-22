import spockVsYodaConfig from './spockvsyoda';
import catsVsDogsConfig from './catsvsdogs';
import matrixVsHackersConfig from './matrixvshackers';
import has from '@dojo/framework/core/has';

const config = has('spock-vs-yoda') && spockVsYodaConfig ||
				has('hackers-vs-matrix') && matrixVsHackersConfig ||
				catsVsDogsConfig;

function getAPIServer() {
	const location: Location = (<any>window).location;
	const query = location.search.substr(1).split('&').filter(str => str.indexOf('host') === 0).map(str => str.split('='));
	const host = query[0] ? query[0][1] : (location.hostname.includes('github') ? 'devpaul' : 'local');
	const protocol = location.protocol;

	switch (host) {
		case 'devpaul':
			return `${protocol}//app.devpaul.com`;
		case 'local':
			return '';
		default:
			return '';
	}
}

export const baseUrl = getAPIServer();
export const url = `${baseUrl}/api`;
export default config;
