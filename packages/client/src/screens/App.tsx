import { create, tsx } from '@dojo/framework/core/vdom';
import Outlet from '@dojo/framework/routing/Outlet';

import { Route } from '../routes';
import { Results } from './results/Results';
import { Select } from './select/Select';

const factory = create({});

export const App = factory(function App() {
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
});
