import { Module } from '@nestjs/common';
import { WandWoodService } from './wand-wood.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WandWood } from './entities/wand-wood.entity';
import {
  ModWandCoreMenu,
  ModWandMenuGroup,
  ModWandWoodMenu,
} from './wand-mod.group';
import { WandCoreService } from './wand-core.service';
import { WandCore } from './entities/wand-core.entity';
import { WandCoreMenu, WandMenuGroup, WandWoodMenu } from './wand.group';

@Module({
  imports: [TypeOrmModule.forFeature([WandWood, WandCore])],
  providers: [
    ModWandMenuGroup,
    WandWoodService,
    WandCoreService,
    ModWandWoodMenu,
    ModWandCoreMenu,
    WandWoodMenu,
    WandCoreMenu,
    WandMenuGroup,
  ],
  exports: [WandWoodService, WandCoreService],
})
export class WandModule {}
