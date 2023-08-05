import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { Guild } from '~/core/guild/guild.entity';
import { House } from '~/core/house/entities/house.entity';

@InputType()
export class CreatePlayerInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  discordId: string;

  @Field(() => ID)
  guildId: string;

  @Field(() => ID, { nullable: true })
  houseId?: string;
}

@InputType()
export class UpdatePlayerInput extends PartialType(CreatePlayerInput) {}

@InputType()
export class FindAllPlayerInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  houseId?: string;

  @Field(() => ID)
  guildId: string;
}
