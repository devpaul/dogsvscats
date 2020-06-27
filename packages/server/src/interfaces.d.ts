declare module 'is-port-reachable' {
	type isPortReachable = (port: number, options: { host: string; timeout?: number }) => Promise<boolean>;
	let isPortReachable: isPortReachable;
	export = isPortReachable;
}
