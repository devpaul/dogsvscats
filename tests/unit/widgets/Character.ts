const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');

import { w } from '@dojo/framework/widget-core/d';
import harness from '@dojo/framework/testing/harness';

import Animal from './../../../src/widgets/Character';

describe('Character', () => {

	it('should construct Character', () => {
		const h = harness(() => w(Animal, {}));
		h.expect(() => null);
	});
});
