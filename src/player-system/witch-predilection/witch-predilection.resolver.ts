import { Resolver } from '@nestjs/graphql';
import { WitchPredilectionsService } from './witch-predilection.service';

@Resolver()
export class WitchPredilectionsResolver {
  constructor(private readonly attributeService: WitchPredilectionsService) {}
}
