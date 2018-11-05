import Outlet from '@dojo/framework/routing/Outlet';
import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import { Button } from './Button';
import { CatContainer } from './CatContainer';
import { DogContainer } from './DogContainer';
import * as css from './styles/App.m.css';
import { CoreAudio } from './CoreAudio';

export default class App extends WidgetBase {
	private coreAudio = new CoreAudio();

	protected render() {
		const coreAudio = this.coreAudio;
		const onPlaySound = (sound: any) => {
			coreAudio.play(sound);
		};

		return v('div', { classes: [css.root] }, [
			v('header', { classes: [css.header] }, [
				w(Button, { to: 'cat' }, ['Cats']),
				v('p', {}, ['vs']),
				w(Button, { to: 'dog' }, ['Dogs'])
			]),
			w(Outlet, { key: 'cat', id: 'cat', renderer: () => w(CatContainer, { onPlaySound }) }),
			w(Outlet, { key: 'dog', id: 'dog', renderer: () => w(DogContainer, { onPlaySound }) })
		]);
	}
}
