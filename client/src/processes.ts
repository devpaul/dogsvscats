import { entries } from '@dojo/framework/shim/object';
import { createCommandFactory, createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';

import { State } from './interfaces';

export interface SetChoiceOpts {
	choice: State['character']['choice'];
}

export interface SetExcitementOpts {
	excitement: State['character']['excitement'];
}

const commandFactory = createCommandFactory<State>();
const baseUrl = (<any>window).location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://catsvsdogs.now.sh';
const url = `${baseUrl}/api`;

function isResults(value: any): value is State['results'] {
	return value && typeof value === 'object' && Object.keys(value).every((key) => typeof value[key] === 'number');
}

const fetchResults = commandFactory(async ({ get, path }) => {
	const response = await fetch(`${url}?cb=${Date.now()}`, { method: 'GET' });
	const results: unknown = await response.json();

	if (response.ok && isResults(results)) {
		return entries(results).reduce((actions: any[], [ character, count ]) => {
			if (count !== get(path('results', character))) {
				actions.push(replace(path('results', character), count));
			}
			return actions;
		}, []);
	}
	return [];
});

const postChoice = commandFactory(async ({ get, path }) => {
	const subject = get(path('character', 'choice'));
	const uuid = get(path('user', 'uuid'));

	if (subject && uuid) {
		await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				subject,
				uuid
			})
		});
	}

	return [];
});

const setChoice = commandFactory<SetChoiceOpts>(({ get, path, payload }) => {
	return [replace(path('character', 'choice'), payload.choice)];
});

const setExcitement = commandFactory<SetExcitementOpts>(({ get, path, payload }) => {
	return [replace(path('character', 'excitement'), payload.excitement)];
});

export const updateResultsProcess = createProcess('update-results', [fetchResults]);
export const setChoiceProcess = createProcess('set-choice', [setChoice, postChoice]);
export const setExcitementProcess = createProcess('set-excitement', [setExcitement]);
