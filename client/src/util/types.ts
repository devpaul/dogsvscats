import { CharacterName } from "../interfaces";

export function isCharacter(value: any): value is CharacterName {
	return value === 'cat' || value === 'dog' || value === 'spock' || value === 'yoda';
}
