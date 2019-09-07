import '@dojo/themes/dojo/index.css';
import 'web-animations-js/web-animations-next-lite.min';

import Registry from '@dojo/framework/core/Registry';
import renderer, { tsx } from '@dojo/framework/core/vdom';
import { registerRouterInjector } from '@dojo/framework/routing/RouterInjector';

import { routes } from './routes';
import { App } from './screens/App';

const registry = new Registry();
registerRouterInjector(routes, registry);

const r = renderer(() => <App />);
r.mount({ registry });
