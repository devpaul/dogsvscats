import { ProcessCallback, createCommandFactory, createProcess } from '@dojo/framework/stores/process';
import { State } from '../../interfaces';
import { replace } from '@dojo/framework/stores/state/operations';
import { NamedProcess } from '../processes';
import { Store } from '@dojo/framework/stores/Store';

const commandFactory = createCommandFactory<State>();

const setComplete = createProcess('request-complete', [
	commandFactory(({ path, payload: { id } }) => {
		return [
			replace(path('request', id), {
				isLoading: false
			})
		];
	})
]);

const setStarting = createProcess('request-sent', [
	commandFactory(({ path, payload: { id } }) => {
		return [
			replace(path('request', id), {
				isLoading: true
			})
		];
	})
]);

const setError = createProcess('set-error', [
	({ path, payload: { id, error } }) => {
		return [replace(path('request', id), { isLoading: false, message: error.message, error })];
	}
]);

export const requestMiddleware: ProcessCallback<State> = () => ({
	before(payload, store, id) {
		setStarting(store)({ id });
	},
	after(errorState, result) {
		const id = result.id;
		if (errorState) {
			const { error } = errorState;
			if (error) {
				result.executor(setError, { id, error });
			}
		} else {
			result.executor(setComplete, { id });
		}
	}
});

export function isLoading({ get, path }: Store<State>, { id }: NamedProcess) {
	return get(path('request', id, 'isLoading'));
}
