import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Guild } from '../guild/guild.entity';

export class CreatePlayerDto {
  name?: string;
  avatarUrl?: string;
  discordId: string;
  guild: Guild;
}
