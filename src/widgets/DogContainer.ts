import { DNode } from '@dojo/framework/widget-core/interfaces';
import { ThemedMixin, theme } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './styles/dogContainer.m.css';
import { v } from '@dojo/framework/widget-core/d';
import WebAnimation from '@dojo/framework/widget-core/meta/WebAnimation';
import { headTilt } from './util/animations';

const head = require('./assets/dog-head.png');
const body = require('./assets/dog-body.png');

/**
 * @type DogContainerProperties
 *
 * Properties that can be set on Animal components
 */
export interface DogContainerProperties {
	onPlaySound?(audio: any): void;
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(css)
export class DogContainer<P extends DogContainerProperties = DogContainerProperties> extends ThemedBase<P> {
	protected render(): DNode | DNode[] {
		const key = 'dogHead';
		this.meta(WebAnimation).animate(key, headTilt('dogHeadTilt'));

		return v('div', { classes: css.root }, [
			v('img', { key, src: head, classes: css.head }),
			v('img', { src: body, classes: css.body }),
			v('button', { onclick: this.onClick }, ['Woof'])
		]);
	}

	private onClick() {
		const { onPlaySound } = this.properties;

		if (onPlaySound) {
			onPlaySound('woof');
		}
	}
}
