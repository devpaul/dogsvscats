import {Body, Controller, Delete, Get, Header, HttpException, HttpStatus, Post} from '@nestjs/common';
import {AppService} from './app.service';

function isBallot(value: any): value is Ballot {
	return value && typeof value.uuid === 'string' && typeof value.subject == 'string';
}

interface Auth {
	password: string;
}

function isAuth(value: any): value is Auth {
	return value && typeof value === 'object' && typeof value.password === 'string';
}

export interface Ballot {
	subject: string;
	uuid: string;
}

@Controller('api')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	@Header('Cache-Control', 'none')
	tallies() {
		return this.appService.get();
	}

	@Post('/password')
	setPassword(@Body() auth: unknown) {
		if (isAuth(auth)) {
			return this.appService.setPassword(auth.password);
		}
		else {
			throw new HttpException('invalid auth', HttpStatus.BAD_REQUEST);
		}
	}

	@Delete()
	reset(@Body() auth: unknown) {
		if (isAuth(auth)) {
			return this.appService.reset(auth.password);
		}
		else {
			throw new HttpException('invalid auth', HttpStatus.FORBIDDEN);
		}
	}

	@Post()
	createRecord(@Body() ballot: unknown) {
		if (isBallot(ballot)) {
			this.appService.vote(ballot.uuid, ballot.subject);
		} else {
			throw new HttpException('invalid ballot', HttpStatus.BAD_REQUEST);
		}
	}
}
