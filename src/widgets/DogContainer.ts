import { DNode } from '@dojo/framework/widget-core/interfaces';
import { ThemedMixin, theme } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './styles/dogContainer.m.css';
import { v } from '@dojo/framework/widget-core/d';

const head = require('./assets/dog-head.png');
const body = require('./assets/dog-body.png');

/**
 * @type DogContainerProperties
 *
 * Properties that can be set on Animal components
 */
export interface DogContainerProperties { }

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(css)
export class DogContainer<P extends DogContainerProperties = DogContainerProperties> extends ThemedBase<P> {
	protected render(): DNode | DNode[] {
		return v('div', {}, [
			v('img', { src: head }),
			v('img', { src: body })
		]);
	}
}
