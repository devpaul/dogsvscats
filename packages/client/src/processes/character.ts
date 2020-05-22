import { entries } from '@dojo/framework/shim/object';
import { createCommandFactory, createProcess } from '@dojo/framework/stores/process';
import { replace } from '@dojo/framework/stores/state/operations';

import { State, Results } from '../interfaces';
import { url } from '../config';
import { requestMiddleware } from './middleware/request';
import { createNamedProcess } from './processes';

export interface SetChoiceOpts {
	choice: State['character']['choice'];
}

export interface SetExcitementOpts {
	excitement: State['character']['excitement'];
}

const commandFactory = createCommandFactory<State>();

function isResults(value: any): value is Results {
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

export const updateResultsProcess = createNamedProcess('update-results', [fetchResults], [ requestMiddleware ]);
export const setChoiceProcess = createNamedProcess('set-choice', [setChoice, postChoice], [ requestMiddleware ]);
export const setExcitementProcess = createProcess('set-excitement', [setExcitement]);
