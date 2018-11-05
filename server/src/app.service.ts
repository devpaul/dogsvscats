import { Injectable } from '@nestjs/common';

export interface Vote {
	recorded: Date;
	subject: string;
	uuid: string;
}

interface VoteData {
	[ key: string ]: number;
}

@Injectable()
export class AppService {
	private counts = new Map<string, number>();

	private records = new Map<string, Vote>();

	vote(uuid: string, subject: string) {
		if (!uuid || !subject) {
			return false;
		}

		const previousRecord = this.records.get(uuid);
		this.records.set(uuid, {
			recorded: new Date(),
			subject,
			uuid
		});
		previousRecord && this.decrementCount(previousRecord.subject);
		this.incrementCount(subject);
	}

	get(): VoteData {
		const data: VoteData = {};
		for (let [ subject, count ] of this.counts.entries()) {
			data[subject] = count;
		}
		return data;
	}

	private incrementCount(subject: string) {
		const count = (this.counts.get(subject) || 0) + 1;
		this.counts.set(subject, count);
	}

	private decrementCount(subject: string) {
		const count = (this.counts.get(subject) || 0) - 1;
		this.counts.set(subject, count);
	}
}
