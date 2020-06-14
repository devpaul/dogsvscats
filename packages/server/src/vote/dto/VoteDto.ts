import { IsString, IsUUID } from 'class-validator';

export class VoteDto {
	@IsString()
	choice!: string;

	@IsUUID()
	voterId!: string;
}
