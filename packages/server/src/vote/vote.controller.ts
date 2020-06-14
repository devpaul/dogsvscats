import { Body, Controller, Get, Header, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Vote } from 'catsvsdogs';
import { VoteService } from './vote.service';

function isVote(value: any): value is Vote {
	return value && typeof value === 'object' && typeof value.userId === 'string' && typeof value.choice == 'string';
}

@Controller('api')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	@Get()
	@Header('Cache-Control', 'none')
	tallies() {
		return this.voteService.getCount();
	}

	@Post()
	createRecord(@Body() vote: unknown) {
		if (isVote(vote)) {
			this.voteService.vote(vote);
		} else {
			throw new HttpException('invalid ballot', HttpStatus.BAD_REQUEST);
		}
	}
}
