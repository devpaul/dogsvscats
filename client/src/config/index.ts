import spockVsYodaConfig from './spockvsyoda';
import catsVsDogsConfig from './catsvsdogs';
import matrixVsHackersConfig from './matrixvshackers';
import has from '@dojo/framework/core/has';

const config = has('spock-vs-yoda') && spockVsYodaConfig ||
				has('hackers-vs-matrix') && matrixVsHackersConfig ||
				catsVsDogsConfig;

function useExternalServer() {
	const location: Location = (<any>window).location;
	return !location.hostname.includes('github') || location.hash.includes('useServerHost');
}

export const baseUrl = useExternalServer() ? 'http://app.devpaul.com' : '';
export const url = `${baseUrl}/api`;
export default config;
