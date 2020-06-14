import catsvsdogsConfig from '../configs/catsvsdogs';
import { NetlifyFunction } from '../interface';
import { jsonResponse, statusResponse } from '../middleware/transform';

export const handler: NetlifyFunction = async function(event, context) {
	switch (event.httpMethod) {
		case 'GET':
			return jsonResponse(catsvsdogsConfig);
		default:
			return statusResponse(404);
	}
};
