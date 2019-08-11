import 'web-animations-js/web-animations-next-lite.min';
import renderer from '@dojo/framework/widget-core/vdom';
import { w } from '@dojo/framework/widget-core/d';
import '@dojo/themes/dojo/index.css';

import App from './screens/App';
import Registry from '@dojo/framework/widget-core/Registry';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';
import Store from '@dojo/framework/stores/Store';
import { State } from './interfaces';
import { initialStateProcess } from './processes';
import { routes } from './routes';

const registry = new Registry();
registerRouterInjector(routes, registry);

const store = new Store<State>();
initialStateProcess(store)({});
registry.defineInjector('state', () => () => store);

const r = renderer(() => w(App, {}));
const domNode = document.getElementById('app');
domNode && r.mount( { domNode, registry });
