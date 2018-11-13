import Outlet from '@dojo/framework/routing/Outlet';
import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import CatsVsDogs from './CatsVsDogs';
import StoreProvider from '@dojo/framework/stores/StoreProvider';
import Store from '@dojo/framework/stores/Store';
import { setChoiceProcess, setExcitementProcess } from '../processes';
import ResultsContainer from './ResultsContainer';

export default class App extends WidgetBase {
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
				renderer: () => w(ResultsContainer, {})
			})
		]);
	}
}
