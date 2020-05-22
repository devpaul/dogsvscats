import { create, tsx } from '@dojo/framework/core/vdom';

import { CharacterConfig } from '../../interfaces';
import { store } from '../../middleware/store';
import { setChoiceProcess, setExcitementProcess } from '../../processes/character';
import { CharacterDisplay } from '../../widgets/character-display/CharacterDisplay';
import { Character } from '../../widgets/character/Character';
import { player } from '../../middleware/player';
import * as css from './select.m.css';

function setDocumentTitle(title: string) {
	document.title = title;
}

const factory = create({ store, player });

export const Select = factory(function({ middleware: { player, store: { get, path, executor }} }) {
	const onChoiceClick = executor(setChoiceProcess);
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
			{ character ?
				<SelectedCharacter
					choice={character} excitement={excitement}
					playSound={ player.play }
					onExcitementChange={(excitement: number) => executor(setExcitementProcess)({ excitement })}
				/> : <Prompt prompt={config.prompt} /> }
		</div>
	);
});

interface CharacterProperties {
	choice: CharacterConfig;
	excitement: number;
	playSound: (sound: string, rate: number) => void;
	onExcitementChange: (excitement: number) => void;
}

const SelectedCharacter = create().properties<CharacterProperties>()(function({ properties }) {
	const { choice, excitement, playSound, onExcitementChange } = properties();

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
})


interface SelectProperties {
	prompt: string;
}

const Prompt = create().properties<SelectProperties>()(function({ properties }) {
	const { prompt } = properties();
	return (<p>{prompt}</p>);
});
