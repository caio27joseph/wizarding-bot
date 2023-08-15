import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { SpellSlot } from './entities/spell-slot.entity';
import {
  CreateSpellSlotInput,
  UpdateSpellSlotInput,
} from './entities/spell-slot.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '~/core/player/entities/player.entity';
import { ExtrasService } from '~/player-system/extras/extras.service';
import { BasicService } from '~/utils/basic.service';

@Injectable()
export class SpellSlotsService extends BasicService<
  SpellSlot,
  CreateSpellSlotInput,
  UpdateSpellSlotInput
> {
  constructor(
    @InjectRepository(SpellSlot) private readonly repo: Repository<SpellSlot>,
    private readonly extrasService: ExtrasService,
  ) {
    super(repo);
  }

  async playerMaxSlots(player: Player) {
    const extras = await this.extrasService.findOne({
      where: { playerId: player.id },
    });
    const max = extras.control * 2;
    return max;
  }

  listSlots(slots: SpellSlot[], max: number) {
    let description = '';
    for (let i = 0; i < max; i++) {
      description += `${i + 1} - ${
        slots.find((s) => s.position === i)?.spell?.name || '*Vazio*'
      }\n`;
    }
    return description;
  }
}
