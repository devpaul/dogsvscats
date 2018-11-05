import 'web-animations-js/web-animations-next-lite.min';
import renderer from '@dojo/framework/widget-core/vdom';
import { w } from '@dojo/framework/widget-core/d';
import '@dojo/themes/dojo/index.css';

import App from './widgets/App';

const r = renderer(() => w(App, {}));
r.mount();
