import { create, tsx } from '@dojo/framework/core/vdom';

import { CharacterDisplayProperties } from '../CharacterDisplay';
import * as css from './faction.m.css';

const factory = create().properties<CharacterDisplayProperties>();

export const Faction = factory(function({ properties, children }) {
	const { choiceName = '', logo } = properties();

	function onPlaySound() {
		const { onPlaySound, excitement, sounds: [ sound ] } = properties();
		sound && onPlaySound && onPlaySound(sound.url, excitement);
	}

	return (
		<div classes={css.characterHolder}>
			<virtual>
				{ children() }
				<button classes={css.button} onclick={onPlaySound}>
					<img class={css.logo} src={logo} /> Join {choiceName} <i classes={css.iconSound}></i>
				</button>
			</virtual>
		</div>
	);
});
