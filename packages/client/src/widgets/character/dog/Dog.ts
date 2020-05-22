import { ThemedMixin, theme } from '@dojo/framework/core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import * as css from './dog.m.css';
import { v } from '@dojo/framework/core/vdom';
import WebAnimation from '@dojo/framework/core/meta/WebAnimation';
import { CharacterProperties } from '../Character';

const head = require('./dog-head.png');
const body = require('./dog-body.png');
const tail = require('./dog-tail.png');

@theme(css)
export class Dog extends ThemedMixin(WidgetBase)<CharacterProperties> {
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
		const { excitement = 1, small } = this.properties;

		this.meta(WebAnimation).animate('dog-head', this._getHeadAnimation(excitement));
		this.meta(WebAnimation).animate('dog-tail', this._getTailAnimation(excitement));

		return v('div', { classes: [ css.root, small ? css.small : null ] }, [
			v('img', { key: 'dog-head', src: head, classes: css.head }),
			v('img', { key: 'dog-body', src: body, classes: css.body }),
			v('img', { key: 'dog-tail', src: tail, classes: css.tail })
		]);
	}
}
