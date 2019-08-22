export interface State {
	character: CharacterDetails;
	config: Config;
	results: Results;
	user: User;
}

export type Character = 'cat' | 'dog' | 'spock' | 'yoda';

export type CharacterDisplay = 'pet' | 'faction';

export interface CharacterDetails {
	choice: Character | undefined;
	excitement: number;
}

export interface Config {
	title: string;
	prompt: string;
	choices: CharacterConfig[];
}

export interface CharacterConfig {
	character: Character;
	choiceName: string;
	sound: SoundConfig[];
	type: CharacterDisplay;
	logo?: string;
}

export type Results = {
	[K in Character]: number;
}

export interface SoundConfig {
	name: string;
	url: string;
}

interface User {
	uuid: string;
}
