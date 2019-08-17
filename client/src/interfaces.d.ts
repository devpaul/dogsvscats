export type Character = 'cat' | 'dog' | 'spock' | 'yoda';

export interface State {
	character: {
		choice: Character | undefined;
		excitement: number;
	};
	results: {
		[K in Character]: number;
	};
	user: {
		uuid: string;
	};
}
