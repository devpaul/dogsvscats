import ThemedMixin from '@dojo/framework/core/mixins/Themed';
import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import { Cat } from './cat/Cat';
import { Dog } from './dog/Dog';
import { Spock } from './spock/Spock';
import { Yoda } from './yoda/Yoda';
import { SoundConfig } from '../../interfaces';

export interface CharacterProperties {
	character: string;
	excitement?: number;
	small?: boolean;
	sounds?: SoundConfig[];
	onExcitementChange?(value: number): void;
	onPlaySound?(sound: string, rate: number): void;
}

export class Character extends ThemedMixin(WidgetBase)<CharacterProperties> {
	protected render() {
		switch (this.properties.character) {
			case 'cat':
				return (<Cat { ... this.properties } />);
			case 'dog':
				return (<Dog { ... this.properties } />);
			case 'spock':
				return (<Spock { ... this.properties } />);
			case 'yoda':
				return (<Yoda { ... this.properties } />);
		}
	}
}
