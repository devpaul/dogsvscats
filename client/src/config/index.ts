import spockVsYodaConfig from './spockvsyoda';
import catsVsDogsConfig from './catsvsdogs';
import matrixVsHackersConfig from './matrixvshackers';
import has from '@dojo/framework/core/has';

const config = has('spock-vs-yoda') && spockVsYodaConfig ||
				has('hackers-vs-matrix') && matrixVsHackersConfig ||
				catsVsDogsConfig;

export default config;
