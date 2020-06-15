export * from './config';
export * from './generics';
export * from './services';

export type CharacterName = 'cat' | 'dog' | 'spock' | 'yoda' | 'trinity' | 'jolie';

export type CharacterDisplay = 'pet' | 'faction';

export type VoteResults = { [K in string]?: number };

export interface Vote {
	voterId: string;
	choice: CharacterName;
}
