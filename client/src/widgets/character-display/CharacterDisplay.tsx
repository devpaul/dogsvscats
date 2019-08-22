import ThemedMixin from '@dojo/framework/core/mixins/Themed';
import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import { SoundConfig } from '../../interfaces';
import { Faction } from '../character-display/faction/Faction';
import { Pet } from '../character-display/pet/Pet';

export interface CharacterDisplayProperties {
	type: string;
	choiceName: string;
	excitement: number;
	logo?: string;
	sounds: SoundConfig[];
	onExcitementChange(value: number): void;
	onSoundClick(sound: string, excitement: number): void;
}

export class CharacterDisplay extends ThemedMixin(WidgetBase)<CharacterDisplayProperties> {
	protected render() {
		switch (this.properties.type) {
			case 'faction':
				return (
					<Faction { ... this.properties }>
						{this.children}
					</Faction>
				);
			case 'pet':
				return (
					<Pet { ... this.properties }>
						{this.children}
					</Pet>
				);
		}

		return undefined;
	}
}
