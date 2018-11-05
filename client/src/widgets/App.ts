import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import { Cat } from './Cat';
import { Dog } from './Dog';
import * as css from './styles/app.m.css';
import { CoreAudio } from './CoreAudio';
import Slider from '@dojo/widgets/slider';

export default class App extends WidgetBase {
	private coreAudio = new CoreAudio();
	private choice: string = '';
	private excitedValue = 1;
	private playing = false;

	private _onChoiceClick(choice: string) {
		this.choice = choice;
		this.invalidate();
	}

	private _onSpeakClick() {
		this.playing = true;
		this.coreAudio.play(this.choice, this.excitedValue, () => {
			this.playing = false;
			this.invalidate();
		});
		this.invalidate();
	}

	private _excitedChange(value: number) {
		this.excitedValue = value;
		this.invalidate();
	}

	protected render() {

		const { excitedValue, choice, playing } = this;

		return v('div', { classes: css.root }, [
			v('header', { classes: css.header }, [
				v('button', { classes: css.button, onclick: () => {
					this._onChoiceClick('cat');
				}}, [ 'Cats' ]),
				v('p', {}, ['vs']),
				v('button', { classes: css.button, onclick: () => {
					this._onChoiceClick('dog');
				}}, [ 'Dogs' ])
			]),
			this.choice ? v('div', { classes: css.controls }, [
				w(Slider, {
					extraClasses: { root: css.slider },
					label: `How Excited is the ${choice}`,
					value: excitedValue,
					min: 0.1,
					max: 3,
					step: 0.1,
					onChange: this._excitedChange
				}),
				v('button', {
					classes: css.button,
					onclick: this._onSpeakClick,
					disabled: playing
				}, [ 'Speak' ])
			]) : undefined,
			this.choice === 'cat' ? w(Cat, { animationSpeed: excitedValue }) : undefined,
			this.choice === 'dog' ? w(Dog, { animationSpeed: excitedValue }) : undefined
		]);
	}
}
