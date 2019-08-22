import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';

import { CharacterDisplayProperties } from '../CharacterDisplay';
import * as css from './faction.m.css';

export class Faction extends WidgetBase<CharacterDisplayProperties> {
	protected render() {
		const { choiceName = '', logo } = this.properties;

		return (
			<div classes={css.characterHolder}>
				<virtual>
					{ this.children }
					<button classes={css.button} onclick={() => this._onPlaySound()}>
						<img class={css.logo} src={logo} /> Join {choiceName} <i classes={css.iconSound}></i>
					</button>
				</virtual>
			</div>
		);
	}

	private _onPlaySound() {
		const { onPlaySound, excitement, sounds: [ sound ] } = this.properties;

		sound && onPlaySound && onPlaySound(sound.url, excitement);
	}
}
