import { Injectable } from '@nestjs/common';

@Injectable()
export class VoteService {
	vote(vote: Vote) {}

	get(): VoteData {}
}
