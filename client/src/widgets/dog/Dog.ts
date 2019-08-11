import { ThemedMixin, theme } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './dog.m.css';
import { v } from '@dojo/framework/widget-core/d';
import WebAnimation from '@dojo/framework/widget-core/meta/WebAnimation';

const head = require('./dog-head.png');
const body = require('./dog-body.png');
const tail = require('./dog-tail.png');

export interface DogProperties {
	animationSpeed?: number;
	small?: boolean;
}

@theme(css)
export class Dog extends ThemedMixin(WidgetBase)<DogProperties> {
	private _getHeadAnimation(animationSpeed: number) {
		return {
			id: 'dog-head',
			effects: [{ marginBottom: '0px' }, { marginBottom: '7px' }, { marginBottom: '0px' }] as any,
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

	private _getTailAnimation(animationSpeed: number) {
		return {
			id: 'dog-tail',
			effects: [{ transform: 'rotate(10deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }],
			timing: {
				duration: 1000,
				iterations: Infinity
			},
			controls: {
				play: true,
				playbackRate: animationSpeed
			}
		};
	}

	protected render() {
		const { animationSpeed = 1, small } = this.properties;

		this.meta(WebAnimation).animate('dog-head', this._getHeadAnimation(animationSpeed));
		this.meta(WebAnimation).animate('dog-tail', this._getTailAnimation(animationSpeed));

		return v('div', { classes: [ css.root, small ? css.small : null ] }, [
			v('img', { key: 'dog-head', src: head, classes: css.head }),
			v('img', { key: 'dog-body', src: body, classes: css.body }),
			v('img', { key: 'dog-tail', src: tail, classes: css.tail })
		]);
	}
}
