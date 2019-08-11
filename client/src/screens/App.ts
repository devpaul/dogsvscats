import { v, w } from '@dojo/framework/core/vdom';
import Outlet from '@dojo/framework/routing/Outlet';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import StoreProvider from '@dojo/framework/stores/StoreProvider'
import Store, { StatePaths } from '@dojo/framework/stores/Store';

import CatsVsDogs from './catsvsdogs/CatsVsDogs';
import { setChoiceProcess, setExcitementProcess, updateResultsProcess } from '../processes';
import { Results } from './results/Results';
import { Route } from '../routes';

export default class App extends WidgetBase {
	protected render() {
		return v('div', [
			w(Outlet, {
				id: 'catsvsdogs',
				key: Route.Main,
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
				key: Route.Results,
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
