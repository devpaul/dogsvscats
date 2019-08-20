import has from '@dojo/framework/core/has';
import { I18nMixin } from '@dojo/framework/core/mixins/I18n';
import { theme, ThemedMixin } from '@dojo/framework/core/mixins/Themed';
import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import Store, { StatePaths } from '@dojo/framework/stores/Store';
import StoreProvider from '@dojo/framework/stores/StoreProvider';

import { Character, State } from '../../interfaces';
import { Cat } from '../../widgets/cat/Cat';
import { Dog } from '../../widgets/dog/Dog';
import { Spock } from '../../widgets/spock/Spock';
import * as css from './results.m.css';
import bundle from './results.nls';
import { Yoda } from '../../widgets/yoda/Yoda';
import { updateResultsProcess } from '../../processes';

@theme(css)
export class Results extends I18nMixin(ThemedMixin(WidgetBase)) {
	private _update?: () => void;

	protected onAttach() {
		this.updateResults();
		const interval = setInterval(() => this.updateResults(), 3000);
		this.own({
			destroy() {
				if (typeof interval === 'number') {
					clearInterval(interval);
				}
				else {
					(interval as any).unref();
				}
			}
		});
	}

	private updateResults() {
		this._update && this._update();
	}

	protected render() {
		const resultList: Character[] = has('spock-vs-yoda') ? [ 'spock', 'yoda' ] : [ 'cat', 'dog' ];

		return (
			<StoreProvider stateKey="state" paths={(path: StatePaths<any>) => [path('results')]}
				renderer={(store: Store<State>) => {
					const { get, path } = store;
					const results = get(path('results')) || {};

					if (!this._update) {
						this._update = () => { updateResultsProcess(store)({}) };
						this._update();
					}

					return (
						<div classes={css.root}>
							{ resultList.map(character => this.renderResult(character, results[character]))}
						</div>
					);
				}}
			/>
		);
	}

	private renderResult(character: Character, count: number = 0) {
		const { messages } = this.localizeBundle<{ [K in Character]: string }>(bundle);
		const characterName = messages[character];

		return (
			<div>
				<h1 classes={css.header}>{characterName}</h1>
				<p classes={css.total}>{String(count)}</p>
				{ this.renderCharacter(character) }
			</div>
		);
	}

	private renderCharacter(character: Character) {
		if (character === 'spock') {
			return <Spock small={true} />;
		}
		if (character === 'yoda') {
			return <Yoda small={true} />;
		}
		if (character === 'cat') {
			return <Cat small={true} />;
		}
		if (character === 'dog') {
			return <Dog small={true} />;
		}
	}
}
