import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Role } from 'discord.js';
import { Guild } from '../guild/guild.entity';

export class CreateHouseDto {
  title?: string;
  imageUrl?: string;
  color?: number;
  guild: Guild;
  discordRoleId: string;
}

export class UpdateHouseDto extends PartialType(
  OmitType(CreateHouseDto, ['guild', 'discordRoleId']),
) {}
