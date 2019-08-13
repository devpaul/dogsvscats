import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import * as css from './cat.m.css';
import { v } from '@dojo/framework/core/vdom';
import WebAnimation from '@dojo/framework/core/meta/WebAnimation';
import ThemedMixin from '@dojo/framework/core/mixins/Themed';

const head = require('./cat-head.png');
const body = require('./cat-body.png');
const tail = require('./cat-tail.png');

export interface CatProperties {
	animationSpeed?: number;
	small?: boolean;
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
		const { animationSpeed = 1, small } = this.properties;

		this.meta(WebAnimation).animate('cat-head', this._getHeadAnimation(animationSpeed));
		this.meta(WebAnimation).animate('cat-tail', this._getTailAnimation(animationSpeed));

		return v('div', { classes: [ css.root, small ? css.small : null ] }, [
			v('img', { key: 'cat-head', src: head, classes: css.head }),
			v('img', { key: 'cat-body', src: body, classes: css.body }),
			v('img', { key: 'cat-tail', src: tail, classes: css.tail })
		]);
	}
}
