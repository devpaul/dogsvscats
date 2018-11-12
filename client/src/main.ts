import 'web-animations-js/web-animations-next-lite.min';
import renderer from '@dojo/framework/widget-core/vdom';
import { w } from '@dojo/framework/widget-core/d';
import '@dojo/themes/dojo/index.css';

import App from './widgets/App';
import Registry from '@dojo/framework/widget-core/Registry';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import Store from '@dojo/framework/stores/Store';
import { State } from './interfaces';
import { initialStateProcess } from './processes';

const registry = new Registry();
registerRouterInjector(
	[
		{
			path: 'catsvsdogs',
			outlet: 'catsvsdogs',
			defaultRoute: true
		},
		{
			path: 'results',
			outlet: 'results'
		}
	],
	registry
);

const store = new Store<State>();
initialStateProcess(store)({});
registry.defineInjector('state', () => () => store);

const r = renderer(() => w(App, {}));
r.mount({ registry });
