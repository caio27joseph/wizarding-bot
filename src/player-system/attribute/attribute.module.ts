import { Module } from '@nestjs/common';
import { AttributeResolver } from './attribute.resolver';
import { PlayerModule } from '~/core/player/player.module';
import { AttributeGroup } from './attribute.group';
import { AttributeService } from './attribute.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attributes } from './entities/attributes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attributes]), PlayerModule],
  providers: [AttributeResolver, AttributeService, AttributeGroup],
  exports: [AttributeService],
})
export class AttributeModule {}
