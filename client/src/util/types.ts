import { Character } from "../interfaces";

export function isCharacter(value: any): value is Character {
	return value === 'cat' || value === 'dog' || value === 'spock' || value === 'yoda';
}
