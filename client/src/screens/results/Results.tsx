import { tsx } from '@dojo/framework/core/vdom';
import { theme, ThemedMixin } from '@dojo/framework/core/mixins/Themed';
import { I18nMixin } from '@dojo/framework/core/mixins/I18n';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import * as css from './results.m.css';
import { Cat } from '../../widgets/cat/Cat';
import { Dog } from '../../widgets/dog/Dog';
import { State, Character } from '../../interfaces';
import Store, { StatePaths } from '@dojo/framework/stores/Store';
import has from '@dojo/framework/core/has';
import StoreProvider from '@dojo/framework/stores/StoreProvider';
import { entries } from '@dojo/framework/shim/object'
import bundle from './results.nls';
import { isCharacter } from '../../util/types';

@theme(css)
export class Results extends I18nMixin(ThemedMixin(WidgetBase)) {
	protected onAttach() {
		const interval = setInterval(() => this.updateResults(), 3000);
		this.own({
			destroy() {
				if (typeof interval === 'number') {
					clearInterval(interval);
				}
				else {
					interval.unref();
				}
			}
		});
	}

	private updateResults() {
		this.invalidate();
	}

	protected render() {
		return (
			<StoreProvider stateKey="state" paths={(path: StatePaths<any>) => [path('results')]}
				renderer={(store: Store<State>) => {
					const { get, path } = store;
					const results = entries(get(path('results')) || {})
						.filter(([ key ]) => isCharacter(key))

					return (
						<div classes={css.root}>
							{ results.map(([ character, count ]) => this.renderResult(character, count)) }
						</div>
					);
				}}
			/>
		);
	}

	private renderResult(character: Character, count: number) {
		const { messages } = this.localizeBundle<{ [K in Character]: string }>(bundle);
		const characterName = messages[character];

		return (
			<div>
				<h1 classes={css.header}>{characterName}</h1>
				<p classes={css.total}>{count}</p>
				{ this.renderCharacter(character) }
			</div>
		);
	}

	private renderCharacter(character: Character) {
		if (has('spock-vs-yoda')) {
		}
		else {
			if (character === 'cat') {
				return <Cat small={true} />
			}
			if (character === 'dog') {
				return <Dog small={true} />
			}
		}
	}
}
