import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';

import { CharacterDisplayProperties } from '../CharacterDisplay';
import * as css from './faction.m.css';

export class Faction extends WidgetBase<CharacterDisplayProperties> {
	protected render() {
		const { choiceName = '', excitement, logo, sounds: [ sound ], onSoundClick } = this.properties;

		return (
			<div classes={css.characterHolder}>
				<virtual>
					{ this.children }
					<button classes={css.button} onclick={() => onSoundClick(sound.url, excitement)}>
						<img class={css.logo} src={logo} /> Join {choiceName} <i classes={css.iconSound}></i>
					</button>
				</virtual>
			</div>
		);
	}
}
