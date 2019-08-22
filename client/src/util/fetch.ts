function shouldUseServerHost() {
	const hostname: string = (<any>window).location.hostname;

	return hostname.includes('github');
}

export const baseUrl = shouldUseServerHost() ? 'https://catsvsdogs.now.sh' : '';
export const url = `${baseUrl}/api`;
