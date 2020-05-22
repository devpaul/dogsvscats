import { create, tsx } from '@dojo/framework/core/vdom';

import { CharacterProperties } from '../Character';
import { Human } from '../Human';
import * as css from './spock.m.css';

const head = require('./spock-head.png');
const body = require('./spock-body.png');

const factory = create().properties<CharacterProperties>();

export const Spock = factory(function({ properties }) {
	const props = {
		... properties(),
		body,
		head
	}
	return <Human extraClasses={{
		head: css.head,
		body: css.body
	}} { ... props } />;
});
