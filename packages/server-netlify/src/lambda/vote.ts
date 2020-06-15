import { Vote, VoteResults } from 'catsvsdogs';
import { NetlifyFunction } from '../interface';
import { errorResponse, jsonResponse, statusResponse } from '../middleware/transform';
import { VoteService } from '../services/VoteService';

export const handler: NetlifyFunction = function(event, context) {
	try {
		switch (event.httpMethod) {
			case 'GET':
				return handleGet(event, context);
			case 'POST':
				return handlePost(event, context);
			case 'DELETE':
				return handleDelete(event, context);
			default:
				return statusResponse(404);
		}
	} catch(e) {
		return errorResponse(e);
	}
};

const handleGet: NetlifyFunction = (event, context) => {
	console.log(event.path);
	if (event.path === '/vote/total') {
		return handleGetTotals(event, context);
	}
	else {
		return handleGetChoices(event, context);
	}
};

const handleGetTotals: NetlifyFunction = async (event, context) => {
	const service = new VoteService();

	return jsonResponse(await service.listChoices())
}

const handleGetChoices: NetlifyFunction = async (event, context) => {
	const service = new VoteService();

	const choices: string[] = event.queryStringParameters['choices'].split(',');
	const totals: VoteResults = {};

	for (let choice of choices) {
		totals[choice] = await service.voteTotal(choice);
	}

	return jsonResponse(totals)
}

const handlePost: NetlifyFunction = async (event) => {
	const service = new VoteService();

	const vote = JSON.parse(event.body);
	if (isVote(vote)) {
		await service.vote(vote);
		return statusResponse(200);
	} else {
		return errorResponse('invalid request', 400);
	}
};

const handleDelete: NetlifyFunction = async (event) => {
	const service = new VoteService();

	const choices = event.queryStringParameters['choices'].split(',');
	await service.resetVotes(choices);
	return statusResponse(200);
};

function isVote(value: any): value is Vote {
	return typeof value?.voterId === 'string' && typeof value?.choice === 'string'
}
