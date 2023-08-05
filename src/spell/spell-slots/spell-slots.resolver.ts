import { Resolver } from '@nestjs/graphql';
import { SpellSlotsService } from './spell-slots.service';

@Resolver()
export class SpellSlotsResolver {
  constructor(private readonly spellSlotsService: SpellSlotsService) {}
}
