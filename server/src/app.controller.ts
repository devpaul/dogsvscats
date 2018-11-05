import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';

function isBallot(value: any): value is Ballot {
	return value && typeof value.uuid === 'string' && typeof value.subject == 'string';
}

export interface Ballot {
	subject: string;
	uuid: string;
}

@Controller('api')
export class AppController {
	constructor(private readonly appService: AppService) { }

	@Get()
	tallies() {
		return this.appService.get();
	}

	@Post()
	createRecord(@Body() ballot: unknown) {
		if (isBallot(ballot)) {
			this.appService.vote(ballot.uuid, ballot.subject);
		}
		else {
			throw new HttpException('invalid ballot', HttpStatus.BAD_REQUEST);
		}
	}
}
