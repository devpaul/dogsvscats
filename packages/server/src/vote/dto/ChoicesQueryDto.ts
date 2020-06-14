import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class ChoicesQueryDto {
	@IsArray()
	@IsString({ each: true })
	@Transform((value: string) => value.split(','))
	choices!: string[];
}
