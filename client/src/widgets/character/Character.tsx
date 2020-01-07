import { create, tsx } from '@dojo/framework/core/vdom';
import { SoundConfig, CharacterName } from '../../interfaces';
import { Cat } from './cat/Cat';
import { Dog } from './dog/Dog';
import { Spock } from './spock/Spock';
import { Yoda } from './yoda/Yoda';
import { Trinity } from './trinity/Trinity';
import { Jolie } from './jolie/Jolie';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import { Constructor, WNodeFactory, WidgetBaseTypes } from '@dojo/framework/core/interfaces';

export interface CharacterProperties {
	character: CharacterName;
	excitement?: number;
	small?: boolean;
	sounds?: SoundConfig[];
	onExcitementChange?(value: number): void;
	onPlaySound?(sound: string, rate: number): void;
}

type CharacterWidgetLookup = {
	[P in CharacterName ]: Constructor<WidgetBase<CharacterProperties>> | WNodeFactory<WidgetBaseTypes<CharacterProperties>>;
}

const CharacterMap: CharacterWidgetLookup = {
	'cat': Cat,
	'dog': Dog,
	'spock': Spock,
	'yoda': Yoda,
	'trinity': Trinity,
	'jolie': Jolie
}

const factory = create().properties<CharacterProperties>();

export const Character = factory(function({ properties }) {
	const { character } = properties();
	const Char = CharacterMap[character];
	return <Char { ... properties() } />
});
