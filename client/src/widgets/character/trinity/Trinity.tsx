import { create, tsx } from '@dojo/framework/core/vdom';

import { CharacterProperties } from '../Character';
import { Human } from '../Human';
import * as css from './trinity.m.css';

const head = require('./trinity-head.png');
const body = require('./trinity-body.png');

const factory = create().properties<CharacterProperties>();

export const Trinity = factory(function({ properties }) {
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
