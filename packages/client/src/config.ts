import has from '@dojo/framework/core/has';
import catsVsDogsConfig from './configs/catsvsdogs';
import matrixVsHackersConfig from './configs/matrixvshackers';
import spockVsYodaConfig from './configs/spockvsyoda';
import { CharacterName, Config } from './interfaces';

export type Versus = 'hackers-vs-matrix' | 'spock-vs-yoda' | 'cats-vs-dogs';

/*
 * Configure the config options during build time by using Dojo build arguments
 *
 * dojo build app -f "apiHost" "localhost"
 *
 * @see https://github.com/dojo/webpack-contrib/#static-build-loader
 */

const apiHost = typeof has('apiHost') === 'string' ? has('apiHost') : '';

export const apiBaseUrl = has('netlify') ? '/.netlify/functions/' : `${apiHost}/api/`;

/**
 * @deprecated moving this to configure-time
 */
const versus: Versus = has('spock-vs-yoda')
	? 'spock-vs-yoda'
	: has('hackers-vs-matrix')
	? 'hackers-vs-matrix'
	: 'cats-vs-dogs';

console.log(versus);

export let config: Config;
export let choices: CharacterName[];

switch (versus) {
	case 'cats-vs-dogs':
		config = catsVsDogsConfig;
		choices = ['cat', 'dog'];
		break;
	case 'hackers-vs-matrix':
		config = matrixVsHackersConfig;
		choices = ['jolie', 'trinity'];
		break;
	case 'spock-vs-yoda':
		config = spockVsYodaConfig;
		choices = ['spock', 'yoda'];
		break;
}
