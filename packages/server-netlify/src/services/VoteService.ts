import { VoteEntity } from '@catsvsdogs/persistence/src/entity/VoteEntity';
import { sqljs } from '@catsvsdogs/persistence/src/index';
import { Repository } from 'typeorm';

export class VoteService {
	private async getRepository(): Promise<Repository<VoteEntity>> {
		const con = await sqljs();
		return con.getRepository(VoteEntity);
	}

	async listChoices() {
		const repo = await this.getRepository();
		const result = await repo
			.createQueryBuilder()
			.select('DISTINCT choice')
			.getRawMany();

		return result.map((row: VoteEntity) => row.choice);
	}

	async resetVotes(choices: string[]) {
		const repo = await this.getRepository();

		return repo
			.createQueryBuilder()
			.delete()
			.where('choice IN (:...choices)', { choices })
			.execute();
	}

	async vote(vote: ConstructorParameters<typeof VoteEntity>[0]) {
		const repo = await this.getRepository();

		const entity = new VoteEntity(vote);

		await repo
			.createQueryBuilder()
			.insert()
			.values(vote)
			.onConflict(`("voterId") DO UPDATE SET "choice" = :choice`)
			.setParameter('choice', entity.choice)
			.execute();
	}

	async voteTotal(choice: string) {
		const repo = await this.getRepository();

		return repo.count({ choice });
	}
}
