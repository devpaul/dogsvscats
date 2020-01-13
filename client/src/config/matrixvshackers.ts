import { Config } from "../interfaces";

const config: Config = {
	title: 'Matrix vs Hackers',
	prompt: 'Who do you follow, Trinity or Acid Burn?',
	choices: [
		{
			character: 'trinity',
			choiceName: 'The Matrix',
			sound: [
				{ name: '', url: 'matrix/trinity1.mp3'},
				{ name: '', url: 'matrix/trinity2.mp3'},
			],
			type: 'faction'
		},
		{
			character: 'jolie',
			choiceName: 'Hackers',
			sound: [
				{ name: '', url: 'hackers/acidburn1.mp3'},
				{ name: '', url: 'hackers/acidburn2.mp3'},
			],
			type: 'faction'
		}
	]
}

export default config;
