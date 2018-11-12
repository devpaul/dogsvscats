import { v, w } from '@dojo/framework/widget-core/d';
import WidgetBase from '@dojo/framework/widget-core/WidgetBase';

import { Cat } from './Cat';
import { Dog } from './Dog';
import * as css from './styles/app.m.css';
import { CoreAudio } from './CoreAudio';
import Slider from '@dojo/widgets/slider';
import { Animal } from '../interfaces';
import { SetChoiceOpts, SetExcitementOpts } from '../processes';

export interface CatsVsDogsProperties {
	choice: undefined | Animal;
	excitement: number;
	onChoiceChange(opts: SetChoiceOpts): void;
	onExcitementChange(opts: SetExcitementOpts): void;
}

export default class CatsVsDogs extends WidgetBase<CatsVsDogsProperties> {
	private coreAudio = new CoreAudio();

	private _onChoiceClick(choice: Animal) {
		const { onChoiceChange } = this.properties;
		onChoiceChange && onChoiceChange({ choice });
	}

	private _onSpeakClick() {
		const { choice, excitement } = this.properties;
		this.coreAudio.play(choice!, excitement);
	}

	private _excitedChange(excitement: number) {
		const { onExcitementChange } = this.properties;
		onExcitementChange && onExcitementChange({ excitement });
	}

	protected render() {
		const { choice } = this.properties;

		return v('div', { classes: css.root }, [
			this.renderHeader(),
			choice ? this.renderCharacter(choice!) : undefined
		]);
	}

	private renderCharacter(choice: Animal) {
		const { excitement } = this.properties;
		const soundName = choice === 'cat' ? 'Meow' : 'Woof';

		return v('div', [
			v('div', { classes: css.controls }, [
				w(Slider, {
					extraClasses: { root: css.slider },
					label: `How Excited is the ${choice}`,
					value: excitement,
					min: 0.1,
					max: 3,
					step: 0.1,
					onChange: this._excitedChange
				})
			]),
			choice === 'cat' ? w(Cat, { animationSpeed: excitement }) : w(Dog, { animationSpeed: excitement }),
			v('div', { classes: css.buttonContainer }, [
				v(
					'button',
					{
						classes: css.button,
						onclick: this._onSpeakClick
					},
					[soundName]
				)
			])
		]);
	}

	private renderHeader() {
		return v('header', { classes: css.header }, [
			v(
				'button',
				{
					classes: css.button,
					onclick: () => {
						this._onChoiceClick('cat');
					}
				},
				['Cats']
			),
			v('p', {}, ['vs']),
			v(
				'button',
				{
					classes: css.button,
					onclick: () => {
						this._onChoiceClick('dog');
					}
				},
				['Dogs']
			)
		]);
	}
}
