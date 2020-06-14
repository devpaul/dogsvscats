import { Config } from 'catsvsdogs';
import netlifyConfig from './netlifyBaseConfig';

const config: Config = {
	...netlifyConfig,
	choice: {
		title: 'Cats vs Dogs',
		prompt: 'Choose your side, Cats or Dogs',
		choices: [
			{
				character: 'cat',
				choiceName: 'Cats',
				sound: [{ name: 'Meow', url: 'cat/cat.mp3' }],
				type: 'pet'
			},
			{
				character: 'dog',
				choiceName: 'Dogs',
				sound: [{ name: 'Woof', url: 'dog/dog.mp3' }],
				type: 'pet'
			}
		]
	}
};

export default config;
