import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
	constructor(values: Omit<UserEntity, 'id'>) {
		Object.assign(this, values);
	}

	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	username!: string;

	@Column()
	password!: string;
}
