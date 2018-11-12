declare type Animal = 'cat' | 'dog';

export interface State {
	character: {
		choice: Animal | undefined;
		excitement: number;
	};
	results: {
		[key: string]: number;
	};
	user: {
		uuid: string;
	};
}
