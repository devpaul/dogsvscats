import { DNode } from '@dojo/framework/widget-core/interfaces';
import { ThemedMixin, theme } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './styles/catContainer.m.css';
import { v } from '@dojo/framework/widget-core/d';

const head = require('./assets/cat-head.png');
const body = require('./assets/cat-body.png');

/**
 * @type CatContainerProperties
 *
 * Properties that can be set on Animal components
 */
export interface CatContainerProperties { }

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(css)
export class CatContainer<P extends CatContainerProperties = CatContainerProperties> extends ThemedBase<P> {
	protected render(): DNode | DNode[] {
		return v('div', {}, [
			v('img', { src: head }),
			v('img', { src: body })
		]);
	}
}
