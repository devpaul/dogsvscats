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

export function errorResponse(error: Error | string, statusCode: number = 500): NetlifyResponse {
	return {
		statusCode,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(typeof error === 'string' ? error : error.message)
	};
}
