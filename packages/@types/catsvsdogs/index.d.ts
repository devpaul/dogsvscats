export interface Config {
	api: ApiDefinition;
	assets: AssetDefinition;
	choice: ChoiceDefinition;
}

export interface ApiDefinition {
	baseUrl: string;
	choiceUrl: string;
	resultsUrl: string;
}

export interface AssetDefinition {
	baseUrl: string;
}

export interface ChoiceDefinition {
	title: string;
	prompt: string;
	choices: CharacterDefinition[];
}

export interface CharacterDefinition {
	character: string;
	choiceName: string;
	logo?: string;
	sound: SoundDefinition[];
	type: 'pet' | 'faction';
}

export interface SoundDefinition {
	name: string;
	url: string;
}
