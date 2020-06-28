import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class catsvsdogs1593236561150 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'vote',
				columns: [
					{
						name: 'id',
						type: 'varchar',
						isPrimary: true,
					},
					{
						name: 'voterId',
						type: 'varchar',
						isUnique: true,
					},
					{
						name: 'choice',
						type: 'varchar',
					},
				],
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		queryRunner.dropTable('entity');
	}
}
