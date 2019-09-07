import { i18n } from '@dojo/framework/core/middleware/i18n';
import { create, tsx } from '@dojo/framework/core/vdom';

import { Character as CharacterType } from '../../interfaces';
import { interval } from '../../middleware/interval';
import { store } from '../../middleware/store';
import { updateResultsProcess } from '../../processes/character';
import { isLoading } from '../../processes/middleware/request';
import { Character } from '../../widgets/character/Character';
import * as css from './results.m.css';
import bundle from './results.nls';

const factory = create({ interval, store, isLoading });

export const Results = factory(function({ middleware: { interval, store, isLoading } }) {
	const  { executor, get, path } = store;
	const results = get(path('results'));
	const choices = get(path('config', 'choices')) || [];

	interval(() => {
		if (!isLoading(updateResultsProcess)) {
			executor(updateResultsProcess)({});
		}
	}, 2000, 'updateResults', true);

	return (
		<div classes={css.root}>
			{ choices.map(choice => {
				const character = choice.character;
				const count = results[character];
				return <Result character={character} count={count} />
			})}
		</div>
	);
});

interface ResultProperties {
	count: number;
	character: CharacterType;
}

const Result = create({ i18n }).properties<ResultProperties>()(function({ middleware: { i18n }, properties }) {
	const { count, character } = properties();
	const { messages } = i18n.localize<{ [K in CharacterType]: string }>(bundle);
	const characterName = messages[character];

	return (
		<div>
			<h1 classes={css.header}>{characterName}</h1>
			<p classes={css.total}>{String(count)}</p>
			<Character character={character} small={true} />
		</div>
	);
});
