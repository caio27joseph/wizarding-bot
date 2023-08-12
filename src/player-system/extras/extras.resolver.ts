import { Resolver } from '@nestjs/graphql';
import { ExtrasService } from './extras.service';

@Resolver()
export class ExtrasResolver {
  constructor(private readonly extrasService: ExtrasService) {}
}
