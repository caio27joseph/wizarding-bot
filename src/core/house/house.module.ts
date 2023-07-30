import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseResolver } from './house.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from './entities/house.entity';

@Module({
  imports: [TypeOrmModule.forFeature([House])],
  providers: [HouseResolver, HouseService],
  exports: [HouseService],
})
export class HouseModule {}
