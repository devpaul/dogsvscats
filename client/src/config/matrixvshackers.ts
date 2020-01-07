import { Config } from "../interfaces";

const config: Config = {
	title: 'Matrix vs Hackers',
	prompt: 'Who do you follow, Trinity or Acid Burn?',
	choices: [
		{
			character: 'trinity',
			choiceName: 'The Matrix',
			sound: [],
			type: 'faction'
		},
		{
			character: 'jolie',
			choiceName: 'Hackers',
			sound: [],
			type: 'faction'
		}
	]
}

export default config;
