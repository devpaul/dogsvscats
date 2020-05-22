import catsvsdogsConfig from '../configs/catsvsdogs';
import { NetlifyFunction } from '../interface';

export const handler: NetlifyFunction = async function(event, context) {
	switch (event.httpMethod) {
		case 'GET':
			return get(event, context);
		default:
			return {
				statusCode: 404
			};
	}
};

const get: NetlifyFunction = (event, context) => {
	return {
		statusCode: 200,
		body: JSON.stringify(catsvsdogsConfig)
	};
};
