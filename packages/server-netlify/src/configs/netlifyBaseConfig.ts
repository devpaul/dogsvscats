import { Config } from 'catsvsdogs';

const config: Pick<Config, 'api' | 'assets'> = {
	api: {
		baseUrl: '.netlify/functions/',
		resultsUrl: 'results',
		voteUrl: 'vote'
	},
	assets: {
		baseUrl: 'assets'
	}
};

export default config;
