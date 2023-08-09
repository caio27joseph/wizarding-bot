import { Resolver } from '@nestjs/graphql';
import { AttributeService } from './attribute.service';

@Resolver()
export class AttributeResolver {
  constructor(private readonly attributeService: AttributeService) {}
}
