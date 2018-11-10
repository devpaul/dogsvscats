import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import { Cat } from './Cat';
import { Dog } from './Dog';
import * as css from './styles/app.m.css';
import { CoreAudio } from './CoreAudio';
import Slider from '@dojo/widgets/slider';

declare type Animal = 'cat' | 'dog';

export default class App extends WidgetBase {
	private coreAudio = new CoreAudio();
	private choice?: Animal = undefined;
	private excitedValue = 1;

	private _onChoiceClick(choice: Animal) {
		this.choice = choice;
		this.invalidate();
	}

	private _onSpeakClick() {
		const { choice } = this;

		this.coreAudio.play(choice!, this.excitedValue);
	}

	private _excitedChange(value: number) {
		this.excitedValue = value;
		this.invalidate();
	}

	protected render() {
		const { choice } = this;

		return v('div', { classes: css.root }, [
			this.renderHeader(),
			this.choice ? this.renderCharacter(choice!) : undefined
		]);
	}

	private renderCharacter(choice: Animal) {
		const { excitedValue } = this;
		const soundName = choice === 'cat' ? 'Meow' : 'Woof';

		return v('div', [
			v('div', { classes: css.controls }, [
				w(Slider, {
					extraClasses: { root: css.slider },
					label: `How Excited is the ${choice}`,
					value: excitedValue,
					min: 0.1,
					max: 3,
					step: 0.1,
					onChange: this._excitedChange
				})
			]),
			choice === 'cat' ? w(Cat, { animationSpeed: excitedValue }) : w(Dog, { animationSpeed: excitedValue }),
			v('div', { classes: css.buttonContainer }, [
				v('button', {
					classes: css.button,
					onclick: this._onSpeakClick
				}, [ soundName ])
			])
		]);
	}


	private renderHeader() {
		return v('header', {classes: css.header}, [
			v('button', {
				classes: css.button, onclick: () => {
					this._onChoiceClick('cat');
				}
			}, ['Cats']),
			v('p', {}, ['vs']),
			v('button', {
				classes: css.button, onclick: () => {
					this._onChoiceClick('dog');
				}
			}, ['Dogs'])
		]);
	}
}
