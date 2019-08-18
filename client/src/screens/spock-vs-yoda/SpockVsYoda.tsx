import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Store from '@dojo/framework/stores/Store';
import StoreProvider from '@dojo/framework/stores/StoreProvider';

import { CoreAudio } from '../../CoreAudio';
import { Character, State } from '../../interfaces';
import { Spock } from '../../widgets/spock/Spock';
import { Yoda } from '../../widgets/yoda/Yoda';
import * as css from './spockVsYoda.m.css';
import { setChoiceProcess } from '../../processes';

const starfleet = require('./starfleet.svg');
const rebel = require('./rebel.svg');

export default class SpockVsYoda extends WidgetBase {
	private coreAudio = new CoreAudio();

	private _onSpeakClick(choice: Character, excitement: number) {
		this.coreAudio.play(choice!, excitement);
	}

	protected render() {
		return (
			<StoreProvider stateKey="state" renderer={(store: Store<State>) => {
				const choice = store.get(store.path('character', 'choice'));
				const excitement = store.get(store.path('character', 'excitement'));

				return (
					<div classes={css.root}>
						{ this.renderHeader(store) }
						{ this.renderCharacter(choice, excitement) }
					</div>
				)
			}}
			/>
		);
	}

	private renderHeader(store: Store<State>) {
		const onChoiceClick = setChoiceProcess(store);

		return (
			<header classes={css.header}>
				<button classes={css.button} onclick={() => { onChoiceClick({ choice: 'spock' }) }}>Starfleet</button>
				<button classes={css.button} onclick={() => { onChoiceClick({ choice: 'yoda' }) }}>Rebels</button>
			</header>
		);
	}

	private renderCharacter(choice?: Character, excitement: number = 0) {
		if (choice !== 'spock' && choice !== 'yoda') {
			return (<p>Choose your side: Starfleet or Rebels?</p>);
		}

		const onClick = () => { this._onSpeakClick(choice, excitement) }

		return (
			<div>
				{ choice === 'spock' && <virtual>
					<button classes={css.button} onclick={onClick}>
						<img class={css.logo} src={starfleet} /> Join Starfleet <i classes={css.iconSound}></i>
					</button>
					<Spock animationSpeed={excitement} />
				</virtual>}
				{ choice === 'yoda' && <virtual>
					<button classes={css.button} onclick={onClick}>
						<img class={css.logo} src={rebel} /> Join the Rebels <i classes={css.iconSound}></i>
					</button>
					<Yoda animationSpeed={excitement} />
				</virtual>}
			</div>
		);
	}
}
