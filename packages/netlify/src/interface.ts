import { Context } from 'aws-lambda';

export interface NetlifyEvent {
	httpMethod: 'GET' | 'POST' | 'DELETE';
}

export interface NetlifyResponse {
	statusCode: number;
	headers?: { [key: string]: string };
	body?: string;
}

export type Eventually<T> = T | Promise<T>;

export type NetlifyFunction<TResult = any> = (event: NetlifyEvent, context: Context) => Eventually<NetlifyResponse>;
