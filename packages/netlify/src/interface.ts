export interface NetlifyEvent {
	httpMethod: 'GET' | 'POST' | 'DELETE';
}

export interface NetlifyResponse {
	statusCode: number;
	headers?: { [key: string]: string };
	body: string;
}
