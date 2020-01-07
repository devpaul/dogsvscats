import { create, tsx } from '@dojo/framework/core/vdom';

import { CharacterProperties } from '../Character';
import { Human } from '../Human';
import * as css from './jolie.m.css';

const head = require('./jolie-head.png');
const body = require('./jolie-body.png');

const factory = create().properties<CharacterProperties>();

export const Jolie = factory(function({ properties }) {
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
