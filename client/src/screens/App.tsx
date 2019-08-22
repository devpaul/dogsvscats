import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Outlet from '@dojo/framework/routing/Outlet';

import { Route } from '../routes';
import { Results } from './results/Results';
import { Select } from './select/Select';

export default class App extends WidgetBase {
	protected render() {
		return (
			<div>
				<Outlet
					id={Route.Main}
					key="select"
					renderer={() => <Select />}
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
