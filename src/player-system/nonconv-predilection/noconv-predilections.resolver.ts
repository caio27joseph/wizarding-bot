import { Resolver } from '@nestjs/graphql';
import { NonConvPredilectionsService } from './noconv-predilections.service';

@Resolver()
export class NonConvPredilectionsResolver {
  constructor(private readonly attributeService: NonConvPredilectionsService) {}
}
