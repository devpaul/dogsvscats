import { tsx } from '@dojo/framework/core/vdom';
import WidgetBase from '@dojo/framework/core/WidgetBase';
import Store from '@dojo/framework/stores/Store';
import StoreProvider from '@dojo/framework/stores/StoreProvider';
import Slider from '@dojo/widgets/slider';

import { CoreAudio } from '../../CoreAudio';
import { Character, State } from '../../interfaces';
import { setChoiceProcess, setExcitementProcess } from '../../processes';
import { Cat } from '../../widgets/cat/Cat';
import { Dog } from '../../widgets/dog/Dog';
import * as css from './catsVsDogs.m.css';

export default class CatsVsDogs extends WidgetBase {
	private coreAudio = new CoreAudio();

	private _onSpeakClick(choice: Character, excitement: number) {
		this.coreAudio.play(choice!, excitement);
	}

	protected render() {
		return (
			<StoreProvider stateKey="state" renderer={(store: Store<State>) => {
				return (
					<div classes={css.root}>
						{ this.renderHeader(store) }
						{ this.renderCharacter(store) }
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
				<button classes={css.button} onclick={() => { onChoiceClick({ choice: 'cat' }) }}>Cats</button>
				<button classes={css.button} onclick={() => { onChoiceClick({ choice: 'dog' }) }}>Dogs</button>
			</header>
		);
	}

	private renderCharacter(store: Store<State>) {
		const choice = store.get(store.path('character', 'choice'));
		const excitement = store.get(store.path('character', 'excitement')) || 0.2;
		const onExcitementChange = setExcitementProcess(store);

		if (choice !== 'cat' && choice !== 'dog') {
			return (<p>Choose your side above, cats or dogs?</p>);
		}

		const soundName = choice === 'cat' ? 'Meow' : 'Woof';
		const sliderLabel = `How Excited is the ${choice}`;

		return (
			<div classes={css.characterHolder}>
				<Slider
					extraClasses={{ root: css.slider, thumb: css.sliderThumb, track: css.sliderTrack, fill: css.sliderFill }}
					label={sliderLabel}
					value={excitement}
					min={0.2}
					max={5}
					step={0.2}
					onInput={(value) => onExcitementChange({ excitement: Number(value) })}
					output={(value: number) => {
						return `${Math.floor(value * 100)}%`;
					}}
				/>
				<button classes={css.button} onclick={() => { this._onSpeakClick(choice, excitement) }}>{`${soundName} `}<i classes={css.iconSound}></i></button>
				{ choice === 'cat' ? <Cat animationSpeed={excitement} /> : <Dog animationSpeed={excitement} />}
			</div>
		);
	}
}
