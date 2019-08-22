import { uuid } from '@dojo/framework/core/util';
import { createCommandFactory, createProcess } from '@dojo/framework/stores/process';
import { add } from '@dojo/framework/stores/state/operations';
import has from '@dojo/framework/core/has';

import { State } from '../interfaces';

const commandFactory = createCommandFactory<State>();

// Command that creates the basic initial state
export const initialStateCommand = commandFactory(({ path }) => {
	return [
		add(path('character'), {
			choice: undefined,
			excitement: 1
		}),
		add(path('results'), {}),
		add(path('user'), {
			uuid: uuid()
		}),
		add(path('config'), {
			title: has('spock-vs-yoda') ? 'Spock vs Yoda' : 'Cats vs Dogs',
			prompt: has('spock-vs-yoda') ? 'Choose your side: Starfleet or Rebels' : 'Choose your side, Cats or Dogs',
			choices: has('spock-vs-yoda') ? [
				{
					character: 'spock',
					choiceName: 'Starfleet',
					logo: 'assets/spock/starfleet.svg',
					sound: [
						{ name: '', url: 'assets/spock/spock.mp3'},
						{ name: '', url: 'assets/spock/affirmative.mp3'},
						{ name: '', url: 'assets/spock/facinating.mp3'},
						{ name: '', url: 'assets/spock/final.mp3'}
					],
					type: 'faction'
				},
				{
					character: 'yoda',
					choiceName: 'Rebels',
					logo: 'assets/yoda/rebel.svg',
					sound: [
						{ name: '', url: 'assets/yoda/yoda.mp3'},
						{ name: '', url: 'assets/yoda/haha.mp3'},
						{ name: '', url: 'assets/yoda/mmm.mp3'},
						{ name: '', url: 'assets/yoda/oohh.mp3'},
					],
					type: 'faction'
				}
			] : [
				{
					character: 'cat',
					choiceName: 'Cats',
					sound: [ { name: 'Meow', url: 'cat/meow.mp3'} ],
					type: 'pet'
				},
				{
					character: 'dog',
					choiceName: 'Dogs',
					sound: [ { name: 'Woof', url: 'dog/woof.mp3'} ],
					type: 'pet'
				}
			],
		})
	];
});

export const initialStateProcess = createProcess('initial', [initialStateCommand]);
