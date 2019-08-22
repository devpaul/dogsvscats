import { I18nMixin } from '@dojo/framework/core/mixins/I18n';
import { theme, ThemedMixin } from '@dojo/framework/core/mixins/Themed';
import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import Store, { StatePaths } from '@dojo/framework/stores/Store';
import StoreProvider from '@dojo/framework/stores/StoreProvider';

import { Character as CharacterType, State } from '../../interfaces';
import { updateResultsProcess } from '../../processes/character';
import { Character } from '../../widgets/character/Character';
import { createInterval } from '../../util/timer';
import * as css from './results.m.css';
import bundle from './results.nls';

@theme(css)
export class Results extends I18nMixin(ThemedMixin(WidgetBase)) {
	private _update?: () => void;

	protected onAttach() {
		this.updateResults();
		this.own(createInterval(() => this.updateResults, 3000));
	}

	private updateResults() {
		this._update && this._update();
	}

	protected render() {
		return (
			<StoreProvider stateKey="state" paths={(path: StatePaths<any>) => [path('results')]}
				renderer={(store: Store<State>) => {
					const { get, path } = store;
					const results = get(path('results')) || {};
					const choices = get(path('config', 'choices')) || [];

					if (!this._update) {
						this._update = () => { updateResultsProcess(store)({}) };
						this._update();
					}

					return (
						<div classes={css.root}>
							{ choices.map(choice => {
								const character = choice.character;
								const count = results[character];
								return this._renderResult(character, count);
							})}
						</div>
					);
				}}
			/>
		);
	}

	private _renderResult(character: CharacterType, count: number = 0) {
		const { messages } = this.localizeBundle<{ [K in CharacterType]: string }>(bundle);
		const characterName = messages[character];

		return (
			<div>
				<h1 classes={css.header}>{characterName}</h1>
				<p classes={css.total}>{String(count)}</p>
				<Character character={character} small={true} />
			</div>
		);
	}
}
