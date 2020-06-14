import { Vote } from 'catsvsdogs';
import { NetlifyFunction } from '../interface';
import { errorResponse, jsonResponse, statusResponse } from '../middleware/transform';
import { addVote, getVoteResults } from '../services/voteService';

export const handler: NetlifyFunction = function(event, context) {
	switch (event.httpMethod) {
		case 'GET':
			return fetchResults(event, context);
		case 'POST':
			return handleVote(event, context);
		default:
			return statusResponse(404);
	}
};

function isVote(value: any): value is Vote {
	return typeof value === 'object' && typeof value.userId === 'string' && typeof value.choice === 'string';
}

const fetchResults: NetlifyFunction = (event, context) => {
	return jsonResponse(getVoteResults(['cat', 'dog']));
};

const handleVote: NetlifyFunction = async (event, context) => {
	try {
		const vote = JSON.parse(event.body);
		if (isVote(vote)) {
			await addVote(vote);
			return statusResponse(200);
		} else {
			return errorResponse('invalid request', 400);
		}
	} catch (e) {
		return errorResponse(e);
	}
};
