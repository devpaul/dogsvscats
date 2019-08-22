import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Slider from '@dojo/widgets/slider';
import { CharacterDisplayProperties } from '../CharacterDisplay';

import * as css from './pet.m.css';

export class Pet extends WidgetBase<CharacterDisplayProperties> {
	protected render() {
		const { excitement, choiceName, sounds: [ sound ], onExcitementChange } = this.properties;
		const sliderLabel = `How Excited is the ${choiceName}`;

		return (
			<div classes={css.characterHolder}>
				<Slider
					extraClasses={{ root: css.slider, thumb: css.sliderThumb, track: css.sliderTrack, fill: css.sliderFill }}
					label={sliderLabel}
					value={excitement}
					min={0.2}
					max={5}
					step={0.2}
					onInput={(value) => onExcitementChange(Number(value))}
					output={(value: number) => {
						return `${Math.floor(value * 100)}%`;
					}}
				/>
				{ sound && <button classes={css.button} onclick={() => { this._onPlaySound() }}>{`${sound.name} `}<i classes={css.iconSound}></i></button> }
				{ this.children }
			</div>
		);
	}

	private _onPlaySound() {
		const { onPlaySound, excitement, sounds: [ sound ] } = this.properties;

		sound && onPlaySound && onPlaySound(sound.url, excitement);
	}
}
