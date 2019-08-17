import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Outlet from '@dojo/framework/routing/Outlet';

import { Route } from '../routes';
import CatsVsDogs from './cats-vs-dogs/CatsVsDogs';
import { Results } from './results/Results';

export default class App extends WidgetBase {
	protected render() {
		return (
			<div>
				<Outlet
					id={Route.Main}
					key="characterSelect"
					renderer={() => <CatsVsDogs /> }
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
