import { Handle } from "@dojo/framework/core/Destroyable";

export function createInterval(cb: () => void, time: number): Handle {
	const interval = setInterval(cb, time);
	return {
		destroy() {
			if (typeof interval === 'number') {
				clearInterval(interval);
			}
			else {
				(interval as any).unref();
			}
		}
	};
}
