import { InputType, PartialType } from '@nestjs/graphql';
import { TrainGroupOption } from './train.entity';
import { Spell } from '~/spell/entities/spell.entity';
import { Player } from '~/core/player/entities/player.entity';

@InputType()
export class CreateTrainInput {
  success: number;

  spell: Spell;
  spellId: string;

  player: Player;
  playerId: string;

  messageId: string;
  channelId: string;

  group?: TrainGroupOption;
}

@InputType()
export class UpdateTrainInput extends PartialType(CreateTrainInput) {}

@InputType()
export class FindAllTrainInput {}
