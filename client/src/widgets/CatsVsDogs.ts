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
			v('header', { classes: css.header }, [
				v('button', {
					classes: css.button,
					onclick: () => {
						this._onChoiceClick('cat');
					}
				}, ['Cats']),
				v('button', {
					classes: css.button,
					onclick: () => {
						this._onChoiceClick('dog');
					}
				}, ['Dogs'])
			]),
			this.renderCharacter(choice)
		]);
	}

	private renderCharacter(choice?: Animal) {

		if (!choice) {
			return undefined;
		}

		const { excitement } = this.properties;
		const soundName = choice === 'cat' ? 'Meow' : 'Woof';

		return v('div', { classes: css.characterHolder }, [
			w(Slider, {
				extraClasses: { root: css.slider, thumb: css.sliderThumb, track: css.sliderTrack, fill: css.sliderFill },
				label: `How Excited is the ${choice}`,
				value: excitement,
				min: 0.2,
				max: 5,
				step: 0.2,
				onInput: this._excitedChange,
				output: (value: number) => {
					return `${Math.floor(value * 100)}%`;
				}
			}),
			v('button', {
				classes: css.button,
				onclick: this._onSpeakClick
			}, [soundName, '  ', v('i', { classes: css.iconSound })]),
			choice === 'cat' ? w(Cat, { animationSpeed: excitement }) : w(Dog, { animationSpeed: excitement })
		]);
	}
}
