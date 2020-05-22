import { Handler } from 'aws-lambda';
import { NetlifyEvent, NetlifyResponse } from '../interface';

export const handler: Handler<NetlifyEvent, NetlifyResponse> = async function(event, context) {
	switch (event.httpMethod) {
		default:
			return {
				statusCode: 200,
				body: 'hello'
			};
	}
};
