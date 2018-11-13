import { createStoreContainer } from '@dojo/framework/stores/StoreInjector';
import { Results } from './Results';
import { updateResultsProcess } from '../processes';

export default createStoreContainer<any>()(Results, 'state', {
	paths: [['results']],
	getProperties(store) {
		const { get, path } = store;
		const catCount = get(path('results', 'cat')) || 0;
		const dogCount = get(path('results', 'dog')) || 0;

		return {
			catCount,
			dogCount,
			fetchResults: () => {
				updateResultsProcess(store)({})
			}
		};
	}
});
