import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './entities/space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Space])],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
