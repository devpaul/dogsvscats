import { VoteEntity } from '@catsvsdogs/persistence/entity/VoteEntity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class VoteService {
	constructor(@InjectRepository(VoteEntity) private voteRepository: Repository<VoteEntity>) {}

	async listChoices() {
		const result = await this.voteRepository.createQueryBuilder().select('DISTINCT choice').getRawMany();

		return result.map((row) => row.choice);
	}

	resetVotes(choices: string[]): Promise<DeleteResult> {
		return this.voteRepository
			.createQueryBuilder()
			.delete()
			.where('choice IN (:...choices)', { choices })
			.execute();
	}

	async vote(vote: ConstructorParameters<typeof VoteEntity>[0]) {
		const entity = new VoteEntity(vote);

		await this.voteRepository
			.createQueryBuilder()
			.insert()
			.values(vote)
			.onConflict(`("voterId") DO UPDATE SET "choice" = :choice`)
			.setParameter('choice', entity.choice)
			.execute();
	}

	voteTotal(choice: string) {
		return this.voteRepository.count({ choice });
	}
}
