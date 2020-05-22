import { NetlifyFunction } from '../interface';
import { jsonResponse, statusResponse } from '../middleware/transform';

export const handler: NetlifyFunction = function(event, context) {
	switch (event.httpMethod) {
		case 'POST':
			return registerVote(event, context);
		default:
			return statusResponse(404);
	}
};

const registerVote: NetlifyFunction = (event, context) => {
	// TODO register a vote in the database
	return jsonResponse({});
};
