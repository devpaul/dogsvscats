import Outlet from '@dojo/framework/routing/Outlet';
import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import CatsVsDogs from './CatsVsDogs';
import StoreProvider from '@dojo/framework/stores/StoreProvider';
import Store, { StatePaths } from '@dojo/framework/stores/Store';
import { setChoiceProcess, setExcitementProcess, updateResultsProcess } from '../processes';
import { Results } from './Results';

export default class App extends WidgetBase {
	protected render() {
		return v('div', [
			w(Outlet, {
				id: 'catsvsdogs',
				key: 'catsvsdogs',
				renderer: () => w(StoreProvider, {
					stateKey: 'state',
					renderer: (store: Store) => {
						const character = store.get(store.path('character'));
						return w(CatsVsDogs, {
							choice: character.choice,
							excitement: character.excitement,
							onChoiceChange: setChoiceProcess(store),
							onExcitementChange: setExcitementProcess(store)
						});
					}
				})
			}),
			w(Outlet, {
				id: 'results',
				key: 'results',
				renderer: () => w(StoreProvider, {
					stateKey: 'state',
					paths: (path: StatePaths<any>) => [path('results')],
					renderer: (store: Store) => {
						const { get, path } = store;
						const catCount = get(path('results', 'cat'));
						const dogCount = get(path('results', 'dog'));

						return w(Results, {
							catCount,
							dogCount,
							fetchResults: () => {
								updateResultsProcess(store)({})
							}
						})
					}
				})

			})
		]);
	}
}
