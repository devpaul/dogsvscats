import createStoreMiddleware from '@dojo/framework/core/middleware/store';
import { uuid } from '@dojo/framework/core/util';
import global from '@dojo/framework/shim/global';
import { createCommandFactory, createProcess } from '@dojo/framework/stores/process';
import { add } from '@dojo/framework/stores/state/operations';
import Store from '@dojo/framework/stores/Store';

import config from '../config';
import { State, User } from '../interfaces';

const commandFactory = createCommandFactory<State>();
const { title, prompt, choices } = config

function isUser(value: any): value is User {
	return value && typeof value === 'object' && typeof value.uuid === 'string';
}

function loadUserData(): User {
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
const initialStateCommand = commandFactory(({ path }) => {
	const user = loadUserData();

	return [
		add(path('character'), {
			choice: undefined,
			excitement: 1
		}),
		add(path('results'), {}),
		add(path('user'), user),
		add(path('config'), {
			title,
			prompt,
			choices
		})
	];
});

const initialStateProcess = createProcess('initial', [initialStateCommand]);

export const store = createStoreMiddleware<State>((store: Store<State>) => {
	initialStateProcess(store)({});
});
