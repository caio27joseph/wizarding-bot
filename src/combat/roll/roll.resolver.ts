import { Resolver } from '@nestjs/graphql';
import { RollService } from './roll.service';

@Resolver()
export class RollResolver {
  constructor(private readonly rollService: RollService) {}
}
