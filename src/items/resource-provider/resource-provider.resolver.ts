import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ResourceProviderService } from './resource-provider.service';
import { ResourceProvider } from './entities/resource-provider.entity';

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
