import { InputType, PartialType } from '@nestjs/graphql';
import { Player } from '~/core/player/entities/player.entity';

@InputType()
export class CreateGrimoireInput {
  player: Player;
  playerId: string;
}

@InputType()
export class UpdateGrimoireInput extends PartialType(CreateGrimoireInput) {}

@InputType()
export class FindAllGrimoireInput {}
