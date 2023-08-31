import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ResourceProvider } from './resource-provider.entity';
import { ResourceProviderService } from './resource-provider.service';

@Resolver(() => ResourceProvider)
export class ResourceProviderResolver {
  constructor(
    // resource provider
    private readonly service: ResourceProviderService,
  ) {}

  @Query(() => [ResourceProvider])
  findAllResourceProvider() {
    return this.service.findAll();
  }

  @Query(() => ResourceProvider)
  findOneResourceProvider() {
    return this.service.findOne();
  }
}
