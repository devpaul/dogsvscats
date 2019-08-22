import WebAnimation from '@dojo/framework/core/meta/WebAnimation';
import ThemedMixin, { theme } from '@dojo/framework/core/mixins/Themed';
import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import * as css from './human.m.css';
import { createInterval } from '../../util/timer';
import { CharacterProperties } from './Character';
import { Handle } from '@dojo/framework/core/Destroyable';

export interface HumanProperties extends CharacterProperties {
	head: string;
	body: string;
}

const MAX_EXCITEMENT = 3;
const MIN_EXCITEMENT = 1;
const EXCITEMENT_STEP = 0.5;
const EXCITEMENT_TIME = 1000;

@theme(css)
export abstract class Human extends ThemedMixin(WidgetBase)<HumanProperties> {
	private soundOffset = 0;
	private excitementTimer?: Handle;

	protected onDetach() {
		if (this.excitementTimer) {
			this.excitementTimer.destroy();
		}
	}

	private _getHeadAnimation(animationSpeed: number) {
		return {
			id: 'character-head',
			effects: [
				{ marginBottom: '0px', transform: 'rotate(0deg)' },
				{ marginBottom: '7px', transform: 'rotate(-10deg)' },
				{ marginBottom: '0px', transform: 'rotate(0deg)' }
			] as any,
			timing: {
				duration: 800,
				iterations: Infinity
			},
			controls: {
				play: true,
				playbackRate: animationSpeed
			}
		};
	}

	protected render() {
		const { head, body, excitement = 1, small } = this.properties;

		this.meta(WebAnimation).animate('character-head', this._getHeadAnimation(excitement));

		return (
			<div classes={[this.theme(css.root), small ? this.theme(css.small) : null ]} onclick={() => this._onClick()}>
				<img key="character-head" src={head} classes={this.theme(css.head)}/>
				<img key="character-body" src={body} classes={this.theme(css.body)}/>
			</div>
		);
	}

	private _onClick() {
		const { onPlaySound, onExcitementChange, excitement = 1, sounds: [, ... list] = [] } = this.properties;

		if (onPlaySound && list && list.length) {
			onPlaySound(list[this.soundOffset % list.length].url, excitement);
			this.soundOffset = (this.soundOffset + 1) % list.length;
		}
		if (onExcitementChange) {
			onExcitementChange(Math.min(excitement + EXCITEMENT_STEP, MAX_EXCITEMENT));
			if (!this.excitementTimer) {
				const timer = createInterval(() => {
					const { onExcitementChange, excitement = MIN_EXCITEMENT } = this.properties;
					const newExcitement = Math.max(MIN_EXCITEMENT, excitement - EXCITEMENT_STEP);
					onExcitementChange && onExcitementChange(newExcitement);
					if (this.excitementTimer && newExcitement === MIN_EXCITEMENT) {
						this.excitementTimer.destroy();
					}
				}, EXCITEMENT_TIME);

				this.excitementTimer = {
					destroy: () => {
						timer.destroy();
						this.excitementTimer = undefined;
					}
				}
			}
		}
	}
}
