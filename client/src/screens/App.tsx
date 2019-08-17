import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import has from '@dojo/framework/core/has';
import Outlet from '@dojo/framework/routing/Outlet';

import { Route } from '../routes';
import { Results } from './results/Results';
import CatsVsDogs from './cats-vs-dogs/CatsVsDogs';
import SpockVsYoda from './spock-vs-yoda/SpockVsYoda';

export default class App extends WidgetBase {
	protected render() {
		return (
			<div>
				<Outlet
					id={Route.Main}
					key="characterSelect"
					renderer={() => has('spock-vs-yoda') ? <SpockVsYoda /> : <CatsVsDogs /> }
				/>
				<Outlet
					id={Route.Results}
					key="results"
					renderer={() => <Results />}
				/>
			</div>
			);
	}
}
