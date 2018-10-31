import { DNode } from '@dojo/framework/widget-core/interfaces';
import { ThemedMixin, theme } from '@dojo/framework/widget-core/mixins/Themed';
import { WidgetBase } from '@dojo/framework/widget-core/WidgetBase';
import * as css from './styles/character.m.css';

/**
 * @type CharacterProperties
 *
 * Properties that can be set on Animal components
 */
export interface CharacterProperties {}

export const ThemedBase = ThemedMixin(WidgetBase);

@theme(css)
export class Character<P extends CharacterProperties = CharacterProperties> extends ThemedBase<P> {
	protected render(): DNode | DNode[] {
		return null;
	}
}
