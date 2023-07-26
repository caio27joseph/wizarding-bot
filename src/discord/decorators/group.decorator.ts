import { SetMetadata } from '@nestjs/common';
import {
  DISCORD_TARGET_GROUPS_METADATA_KEY,
  DISCORD_TARGET_GROUP_OPTIONS_METADATA_KEY,
} from '../discord.constants';
import { DiscordCommandMetadataHandler } from '../command_metadata_handler';

export class GroupOptions {
  name: string;
  description: string;
}
export const getTargetGroups = (): any[] =>
  Reflect.getMetadata(DISCORD_TARGET_GROUPS_METADATA_KEY, GroupOptions) || [];

const setTargetGroups = (targets: any[]) =>
  Reflect.defineMetadata(
    DISCORD_TARGET_GROUPS_METADATA_KEY,
    targets,
    GroupOptions,
  );

const setGroupOptions = (options: GroupOptions, target: any) =>
  Reflect.defineMetadata(
    DISCORD_TARGET_GROUP_OPTIONS_METADATA_KEY,
    options,
    target,
  );
export const getGroupOptions = (target: any): GroupOptions =>
  Reflect.getMetadata(DISCORD_TARGET_GROUP_OPTIONS_METADATA_KEY, target) || {};

/**
 * Decorator for Discord groups.
 *
 * Will register each instance for discord event provider
 * @param options
 */
export function Group(options?: GroupOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function _DiscordController<T extends { new (...args: any[]): {} }>(
    constr: T,
  ) {
    return class extends constr {
      constructor(...args: any[]) {
        super(...args);
        const targets = getTargetGroups();
        targets.push(this);
        setTargetGroups(targets);
        setGroupOptions(options, this);
        targets.forEach((target) => {
          const handler = new DiscordCommandMetadataHandler(target);
        });
      }
    };
  };
}
