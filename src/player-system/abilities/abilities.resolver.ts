import { Resolver } from '@nestjs/graphql';
import { AbilitiesService } from './abilities.service';

@Resolver()
export class AbilitiesResolver {
  constructor(private readonly abilitiesService: AbilitiesService) {}
}
