import { create, tsx } from '@dojo/framework/core/vdom';
import { SoundConfig } from '../../interfaces';
import { Cat } from './cat/Cat';
import { Dog } from './dog/Dog';
import { Spock } from './spock/Spock';
import { Yoda } from './yoda/Yoda';

export interface CharacterProperties {
	character: string;
	excitement?: number;
	small?: boolean;
	sounds?: SoundConfig[];
	onExcitementChange?(value: number): void;
	onPlaySound?(sound: string, rate: number): void;
}


const factory = create().properties<CharacterProperties>();

export const Character = factory(function({ properties }) {
	const { character } = properties();

	switch (character) {
		case 'cat':
			return (<Cat { ... properties() } />);
		case 'dog':
			return (<Dog { ... properties() } />);
		case 'spock':
			return (<Spock { ... properties() } />);
		case 'yoda':
			return (<Yoda { ... properties() } />);
	}
});
