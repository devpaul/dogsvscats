import { VoteEntity } from '@catsvsdogs/persistence/entity/VoteEntity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';

@Module({
	imports: [TypeOrmModule.forFeature([VoteEntity])],
	controllers: [VoteController],
	providers: [VoteService],
})
export class VoteModule {}
