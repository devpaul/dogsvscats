import I18nMixin from '@dojo/framework/core/mixins/I18n';
import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Store from '@dojo/framework/stores/Store';
import StoreProvider from '@dojo/framework/stores/StoreProvider';

import { State, CharacterConfig } from '../../interfaces';
import { setChoiceProcess, setExcitementProcess } from '../../processes';
import * as css from './select.m.css';
import { CharacterDisplay } from '../../widgets/character-display/CharacterDisplay';
import { Character } from '../../widgets/character/Character';
import { CoreAudio } from '../../CoreAudio';

function setDocumentTitle(title: string) {
	document.title = title;
}

export class Select extends I18nMixin(WidgetBase) {
	private audio = new CoreAudio();

	protected render() {
		return (
			<StoreProvider stateKey="state" renderer={(store: Store<State>) => this._renderSelect(store)} />
		);
	}

	private _onPlaySound(sound: string, rate: number) {
		this.audio.play(sound, rate);
	}

	private _renderSelect(store: Store<State>) {
		const { get, path } = store;
		const onChoiceClick = setChoiceProcess(store);
		const config = get(path('config'));
		const { choice, excitement } = get(path('character'));
		const character = config.choices.find(option => option.character === choice);

		setDocumentTitle(config.title);

		return (
			<div classes={css.root}>
				<header classes={css.header}>
					{ config.choices.map(choice => (
						<button classes={css.button} onclick={() => { onChoiceClick({ choice: choice.character }) }}>{choice.choiceName}</button>
					))}
				</header>
				{ character ? this._renderCharacter(store, character, excitement) : this._renderPrompt(config.prompt) }
			</div>
		);
	}

	private _renderCharacter(store: Store<State>, choice: CharacterConfig, excitement: number) {
		const playSound = (sound: string, rate: number) => this._onPlaySound(sound, rate);
		const onExcitementChange = (excitement: number) => setExcitementProcess(store)({ excitement })

		return <CharacterDisplay
			type={choice.type}
			choiceName={choice.choiceName}
			excitement={excitement}
			logo={choice.logo}
			sounds={choice.sound}
			onExcitementChange={onExcitementChange}
			onPlaySound={playSound}
		>
			<Character
				character={choice.character}
				excitement={excitement}
				sounds={choice.sound}
				onPlaySound={playSound}
				onExcitementChange={onExcitementChange}
			/>
		</CharacterDisplay>
	}

	private _renderPrompt(prompt: string) {
		return (<p>{prompt}</p>);
	}
}
