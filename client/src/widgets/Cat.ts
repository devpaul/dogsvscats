import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './styles/cat.m.css';
import { v } from '@dojo/framework/widget-core/d';
import WebAnimation from '@dojo/framework/widget-core/meta/WebAnimation';
import ThemedMixin from '@dojo/framework/widget-core/mixins/Themed';

const head = require('./assets/cat-head.png');
const body = require('./assets/cat-body.png');
const tail = require('./assets/cat-tail.png');

export interface CatProperties {
	animationSpeed: number;
}

export class Cat extends ThemedMixin(WidgetBase)<CatProperties> {
	private _getHeadAnimation(animationSpeed: number) {
		return {
			id: 'cat-head',
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

	private _getTailAnimation(animationSpeed: number) {
		return {
			id: 'cat-tail',
			effects: [
				{ transform: 'rotate(0deg)' },
				{ transform: 'rotate(-10deg)' },
				{ transform: 'rotate(0deg)' }
			],
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
		const { animationSpeed } = this.properties;

		this.meta(WebAnimation).animate('cat-head', this._getHeadAnimation(animationSpeed));
		this.meta(WebAnimation).animate('cat-tail', this._getTailAnimation(animationSpeed));

		return v('div', { classes: css.root }, [
			v('img', { key: 'cat-head', src: head, classes: css.head }),
			v('img', { key: 'cat-body', src: body, classes: css.body }),
			v('img', { key: 'cat-tail', src: tail, classes: css.tail })
		]);
	}
}
