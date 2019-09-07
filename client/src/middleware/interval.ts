import { cache } from '@dojo/framework/core/middleware/cache';
import { uuid } from '@dojo/framework/core/util';
import { create, destroy } from '@dojo/framework/core/vdom';

const factory = create({ destroy, cache });

export const interval = factory(function({ middleware: { destroy, cache }}) {
	return function (callback: () => void, milliseconds: number, name: string = uuid(), callImmediate: boolean = false) {
		if (cache.get(name) == null) {
			const interval = setInterval(callback, milliseconds);
			const handle = {
				destroy() {
					cache.set(name, undefined);
					if (typeof interval === 'number') {
						clearInterval(interval);
					}
					else {
						(interval as any).unref();
					}
				}
			}
			cache.set(name, handle);
			destroy(() => {
				handle.destroy();
			});
			if (callImmediate) {
				callback();
			}
			return handle;
		}
	};
});
