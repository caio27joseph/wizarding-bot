import { Resolver } from '@nestjs/graphql';
import { SpellService } from './spell.service';

@Resolver()
export class SpellResolver {
  constructor(private readonly spellService: SpellService) {}
}
