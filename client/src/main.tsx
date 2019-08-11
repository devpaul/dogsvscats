import '@dojo/themes/dojo/index.css';
import 'web-animations-js/web-animations-next-lite.min';

import renderer, { tsx } from '@dojo/framework/core/vdom';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import Store from '@dojo/framework/stores/Store';
import { registerStoreInjector } from '@dojo/framework/stores/StoreInjector';

import { State } from './interfaces';
import { initialStateProcess } from './processes';
import { routes } from './routes';
import App from './screens/App';

const store = new Store<State>();
const registry = registerStoreInjector(store);
registerRouterInjector(routes, registry);

initialStateProcess(store)({});

const r = renderer(() => <App />);
r.mount({ registry });
r.invalidate();
