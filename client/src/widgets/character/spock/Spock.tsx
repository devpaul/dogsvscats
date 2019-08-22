import { tsx } from '@dojo/framework/core/vdom';
import { WidgetBase } from '@dojo/framework/core/WidgetBase';

import { CharacterProperties } from '../Character';
import { Human } from '../Human';
import * as css from './spock.m.css';

const head = require('./spock-head.png');
const body = require('./spock-body.png');

export class Spock extends WidgetBase<CharacterProperties> {
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
