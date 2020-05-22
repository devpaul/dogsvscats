import { NetlifyFunction } from '../interface';
import { jsonResponse, statusResponse } from '../middleware/transform';

export const handler: NetlifyFunction = function(event, context) {
	switch (event.httpMethod) {
		case 'GET':
			return fetchResults(event, context);
		default:
			return statusResponse(404);
	}
};

const fetchResults: NetlifyFunction = (event, context) => {
	// TODO load results from database
	return jsonResponse({});
};
