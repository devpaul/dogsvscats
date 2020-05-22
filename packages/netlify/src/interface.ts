import { Context } from 'aws-lambda';

export type RequestHeaderNames = '';

export interface NetlifyEvent {
	path: any;
	httpMethod: 'GET' | 'POST' | 'DELETE';
	headers: { [K in RequestHeaderNames]?: string };
	queryStringParameters: { [key: string]: string };
	body: string;
	isBase64Encoded: boolean;
}

export type ResponseHeaderNames = 'Content-Type';

export interface NetlifyResponse {
	statusCode: number;
	headers?: { [T in ResponseHeaderNames]?: string };
	body?: string;
	isBase64Encoded?: boolean;
}

export type Eventually<T> = T | Promise<T>;

export type NetlifyFunction = (event: NetlifyEvent, context: Context) => Eventually<NetlifyResponse>;
