import Outlet from '@dojo/framework/routing/Outlet';
import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import CatsVsDogs from './CatsVsDogs';
import { Results } from './Results';
import StoreProvider from '@dojo/framework/stores/StoreProvider';
import Store from '@dojo/framework/stores/Store';
import { setChoiceProcess, setExcitementProcess, updateResultsProcess } from '../processes';

export default class App extends WidgetBase {
	lastResultsCheck: number = 0;

	protected render() {
		return v('div', [
			w(Outlet, {
				id: 'catsvsdogs',
				key: 'catsvsdogs',
				renderer: () => {
					return w(StoreProvider, {
						stateKey: 'state',
						renderer: (state: Store) => {
							const character = state.get(state.path('character'));
							return w(CatsVsDogs, {
								choice: character.choice,
								excitement: character.excitement,
								onChoiceChange: setChoiceProcess(state),
								onExcitementChange: setExcitementProcess(state)
							});
						}
					});
				}
			}),
			w(Outlet, {
				id: 'results',
				key: 'results',
				renderer: () => {
					return w(StoreProvider, {
						stateKey: 'state',
						renderer: (state: Store) => {
							this.checkResults(state);
							const results = state.get(state.path('results'));
							return w(Results, {
								catCount: results['cat'] || 0,
								dogCount: results['dog'] || 0
							});
						}
					});
				}
			})
		]);
	}

	private checkResults(state: Store) {
		if (Date.now() - 3000 > this.lastResultsCheck) {
			updateResultsProcess(state)({});
			this.lastResultsCheck = Date.now();
		}
	}
}
