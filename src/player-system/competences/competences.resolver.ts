import { Resolver } from '@nestjs/graphql';
import { CompetencesService } from './competences.service';

@Resolver()
export class CompetencesResolver {
  constructor(private readonly attributeService: CompetencesService) {}
}
