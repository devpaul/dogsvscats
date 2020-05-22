import { Config } from 'catsvsdogs';

const config: Pick<Config, 'api' | 'assets'> = {
	api: {
		baseUrl: '.netlify/functions/',
		choiceUrl: 'choice',
		resultsUrl: 'results'
	},
	assets: {
		baseUrl: 'assets'
	}
};

export default config;
