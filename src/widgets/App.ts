import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { v, w } from '@dojo/framework/widget-core/d';
import Outlet from '@dojo/framework/routing/Outlet';
import { Link } from '@dojo/framework/routing/Link';
import { CatContainer } from './CatContainer';
import { DogContainer } from './DogContainer';
import * as css from './styles/App.m.css';

export default class App extends WidgetBase {
	protected render() {
		return v('div', { classes: [css.root] }, [
			v('header', {}, [
				w(Link, { to: 'cat' }, [ 'Cats' ]),
				v('p', {}, [ 'vs' ]),
				w(Link, { to: 'dog' }, [ 'Dogs' ])
			]),
			w(Outlet, { key: 'cat', id: 'cat', renderer: () => w(CatContainer, {}) }),
			w(Outlet, { key: 'dog', id: 'dog', renderer: () => w(DogContainer, {}) })
		]);
	}
}
