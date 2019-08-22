import global from '@dojo/framework/shim/global';
import { uuid } from '@dojo/framework/core/util';
import { createCommandFactory, createProcess } from '@dojo/framework/stores/process';
import { add } from '@dojo/framework/stores/state/operations';
import has from '@dojo/framework/core/has';

import { State, User } from '../interfaces';

const commandFactory = createCommandFactory<State>();

function isUser(value: any): value is User {
	return value && typeof value === 'object' && typeof value.uuid === 'string';
}

function fetchUserData(): User {
	try {
		const data = JSON.parse(global.localStorage.getItem('user'));
		if (isUser(data)) {
			return data;
		}
	}
	catch (e) {}

	const user = { uuid: uuid() };
	global.localStorage.setItem('user', JSON.stringify(user));
	return user;
}

// Command that creates the basic initial state
export const initialStateCommand = commandFactory(({ path }) => {
	const user = fetchUserData();

	return [
		add(path('character'), {
			choice: undefined,
			excitement: 1
		}),
		add(path('results'), {}),
		add(path('user'), user),
		add(path('config'), {
			title: has('spock-vs-yoda') ? 'Spock vs Yoda' : 'Cats vs Dogs',
			prompt: has('spock-vs-yoda') ? 'Choose your side: Starfleet or Rebels' : 'Choose your side, Cats or Dogs',
			choices: has('spock-vs-yoda') ? [
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
			] : [
				{
					character: 'cat',
					choiceName: 'Cats',
					sound: [ { name: 'Meow', url: 'cat/cat.mp3'} ],
					type: 'pet'
				},
				{
					character: 'dog',
					choiceName: 'Dogs',
					sound: [ { name: 'Woof', url: 'dog/dog.mp3'} ],
					type: 'pet'
				}
			],
		})
	];
});

export const initialStateProcess = createProcess('initial', [initialStateCommand]);
