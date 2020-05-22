import { create, tsx } from '@dojo/framework/core/vdom';

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
	onPlaySound?(sound: string, excitement: number): void;
}

const factory = create().properties<CharacterDisplayProperties>();

export const CharacterDisplay = factory(function({ properties, children }) {
	const { type } = properties();

	switch (type) {
		case 'faction':
			return (
				<Faction { ... properties() }>
					{children()}
				</Faction>
			);
		case 'pet':
			return (
				<Pet { ... properties() }>
					{children()}
				</Pet>
			);
	}

	return undefined;
});
