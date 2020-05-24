import { CharacterName, Vote, VoteResults } from '.';
import { Eventually } from './generics';

export type AddVote = (vote: Vote) => Eventually<void>;

export type GetVoteResults = (characters: CharacterName[]) => Eventually<VoteResults>;

export interface VoteService {
	addVote: AddVote;
	getVoteResults: GetVoteResults;
}
