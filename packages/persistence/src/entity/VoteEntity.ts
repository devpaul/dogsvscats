import 'reflect-metadata';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VoteEntity {
	constructor(values: Omit<VoteEntity, 'id'>) {
		Object.assign(this, values);
	}

	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Index({ unique: true })
	@Column()
	voterId!: string;

	@Column()
	choice!: string;
}
