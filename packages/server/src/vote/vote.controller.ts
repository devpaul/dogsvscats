import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ChoicesQueryDto } from './dto/ChoicesQueryDto';
import { VoteDto } from './dto/VoteDto';
import { VoteService } from './vote.service';

interface VoteTotals {
	[key: string]: number;
}

@Controller('/vote')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	@Get()
	listChoices() {
		return this.voteService.listChoices();
	}

	@Get('/total')
	async tallies(@Query() { choices }: ChoicesQueryDto) {
		const totals: VoteTotals = {};

		for (let choice of choices) {
			totals[choice] = await this.voteService.voteTotal(choice);
		}

		return totals;
	}

	@Post()
	async recordVote(@Body() vote: VoteDto): Promise<void> {
		await this.voteService.vote(vote);
	}

	@Delete()
	async resetVote(@Query() { choices }: ChoicesQueryDto): Promise<void> {
		await this.voteService.resetVotes(choices);
	}
}
