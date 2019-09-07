import { create, tsx } from '@dojo/framework/core/vdom';

import { CharacterProperties } from '../Character';
import { Human } from '../Human';
import * as css from './yoda.m.css';

const head = require('./yoda-head.png');
const body = require('./yoda-body.png');

const factory = create().properties<CharacterProperties>();

export const Yoda = factory(function({ properties }) {
	const props = {
		... properties(),
		body,
		head
	};

	return <Human extraClasses={{
		head: css.head,
		body: css.body
	}} { ... props } />;
});
