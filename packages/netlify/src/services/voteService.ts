import { CharacterName, Vote, VoteResults, VoteService } from 'catsvsdogs';

const voteService: VoteService = {
	addVote,
	getVoteResults
};

export default voteService;

export async function getVoteResults(characters: CharacterName[]): Promise<VoteResults> {
	// TODO get a total of all votes for each character
	return {};
}

export async function addVote(vote: Vote) {
	// TODO delete an existing vote by the user
	// TODO register the vote by the user
}
