import { create, tsx } from '@dojo/framework/core/vdom';
import Slider from '@dojo/widgets/slider';

import { CharacterDisplayProperties } from '../CharacterDisplay';
import * as css from './pet.m.css';

const factory = create().properties<CharacterDisplayProperties>();

export const Pet = factory(function Pet({ properties, children }) {
	const { excitement, choiceName, sounds: [ sound ], onExcitementChange } = properties();
	const sliderLabel = `How Excited is the ${choiceName}`;

	function onPlaySound() {
		const { onPlaySound, excitement, sounds: [ sound ] } = properties();
		sound && onPlaySound && onPlaySound(sound.url, excitement);
	}

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
			{ sound && <button classes={css.button} onclick={onPlaySound}>{`${sound.name} `}<i classes={css.iconSound}></i></button> }
			{ children() }
		</div>
	);
});
