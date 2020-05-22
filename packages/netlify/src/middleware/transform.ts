import { NetlifyResponse } from '../interface';

export function jsonResponse<T extends object = object>(value: T): NetlifyResponse {
	return {
		statusCode: 200,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(value)
	};
}

export function statusResponse(statusCode: number): NetlifyResponse {
	return {
		statusCode
	};
}
