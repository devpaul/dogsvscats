import I18nMixin from '@dojo/framework/core/mixins/I18n';
import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Store from '@dojo/framework/stores/Store';
import StoreProvider from '@dojo/framework/stores/StoreProvider';

import { State, CharacterConfig } from '../../interfaces';
import { setChoiceProcess } from '../../processes';
import * as css from './select.m.css';
import { CharacterDisplay } from '../../widgets/character-display/CharacterDisplay';
import { Character } from '../../widgets/character/Character';

function setDocumentTitle(title: string) {
	document.title = title;
}

export class Select extends I18nMixin(WidgetBase) {
	protected render() {
		return (
			<StoreProvider stateKey="state" renderer={(store: Store<State>) => this._renderSelect(store)} />
		);
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
				{ character ? this._renderCharacter(character, excitement) : this._renderPrompt(config.prompt) }
			</div>
		);
	}

	private _renderCharacter(choice: CharacterConfig, excitement: number) {
		const onExcitementChange = () => {}; // TODO
		const onSoundClick = () => {}; // TODO
		const onCharacterClick = undefined; // TODO

		return <CharacterDisplay
			type={choice.type}
			choiceName={choice.choiceName}
			excitement={excitement}
			logo={choice.logo}
			sounds={choice.sound}
			onExcitementChange={onExcitementChange}
			onSoundClick={onSoundClick}
		>
			<Character
				character={choice.character}
				excitement={excitement}
				onCharacterClick={onCharacterClick}
			/>
		</CharacterDisplay>
	}

	private _renderPrompt(prompt: string) {
		return (<p>{prompt}</p>);
	}
}
