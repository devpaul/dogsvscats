import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import { CharacterProperties } from '../Character';
import { Human } from '../Human';
import * as css from './yoda.m.css';

const head = require('./yoda-head.png');
const body = require('./yoda-body.png');

export class Yoda extends WidgetBase<CharacterProperties> {
	protected render() {
		const properties = {
			... this.properties,
			body,
			head
		}
		return <Human extraClasses={{
			head: css.head,
			body: css.body
		}} { ... properties } />;
	}
}
