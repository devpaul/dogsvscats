import { DNode } from '@dojo/framework/widget-core/interfaces';
import { ThemedMixin, theme } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './styles/catContainer.m.css';
import { v } from '@dojo/framework/widget-core/d';
import WebAnimation from '@dojo/framework/widget-core/meta/WebAnimation';
import { headTilt } from './util/animations';

const head = require('./assets/cat-head.png');
const body = require('./assets/cat-body.png');

/**
 * @type CatContainerProperties
 *
 * Properties that can be set on Animal components
 */
export interface CatContainerProperties {
	onPlaySound?(audio: any): void;
}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(css)
export class CatContainer<P extends CatContainerProperties = CatContainerProperties> extends ThemedBase<P> {
	protected render(): DNode | DNode[] {
		const key = 'cathead';
		this.meta(WebAnimation).animate(key, headTilt('catHeadTilt'));

		return v('div', { classes: css.root }, [
			v('img', { key, src: head, classes: css.head }),
			v('img', { src: body, classes: css.body }),
			v('button', { onclick: this.onClick }, ['Meow'])
		]);
	}

	private onClick() {
		const { onPlaySound } = this.properties;

		if (onPlaySound) {
			onPlaySound('meow');
		}
	}
}
