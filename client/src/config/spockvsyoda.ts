import { Config } from "../interfaces";

const config: Config = {
	title: 'Spock vs Yoda',
	prompt: 'Choose your side: Starfleet or Rebels',
	choices: [
		{
			character: 'spock',
			choiceName: 'Starfleet',
			logo: 'assets/spock/starfleet.svg',
			sound: [
				{ name: '', url: 'spock/spock.mp3'},
				{ name: '', url: 'spock/affirmative.mp3'},
				{ name: '', url: 'spock/facinating.mp3'}
			],
			type: 'faction'
		},
		{
			character: 'yoda',
			choiceName: 'Rebels',
			logo: 'assets/yoda/rebel.svg',
			sound: [
				{ name: '', url: 'yoda/yoda.mp3'},
				{ name: '', url: 'yoda/haha.mp3'},
				{ name: '', url: 'yoda/mmm.mp3'},
				{ name: '', url: 'yoda/oohh.mp3'},
			],
			type: 'faction'
		}
	]
}

export default config;
