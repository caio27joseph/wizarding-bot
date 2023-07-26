import {
  DISCORD_COMMAND_METHODS_METADATA_KEY,
  DISCORD_COMMAND_OPTIONS_METADATA_KEY,
} from '../discord.constants';

export class CommandOptions {
  name?: string;
  aliases?: string[];
  description?: string;
  placeholder?: string;
}

export class DiscordCommandMetadataHandler {
  constructor(public readonly target: any) {}

  getMethodKeys(): string[] {
    const commands =
      Reflect.getMetadata(DISCORD_COMMAND_METHODS_METADATA_KEY, this.target) ||
      [];
    return commands;
  }
  private setMethodKeys(commands: string[]) {
    Reflect.defineMetadata(
      DISCORD_COMMAND_METHODS_METADATA_KEY,
      commands,
      this.target,
    );
  }
  addCommands(propertyKey: string) {
    const commands = this.getMethodKeys();
    commands.push(propertyKey);
    this.setMethodKeys(commands);
  }

  setCommandOptions(options: CommandOptions, propertyKey: string) {
    Reflect.defineMetadata(
      DISCORD_COMMAND_OPTIONS_METADATA_KEY,
      options,
      this.target,
      propertyKey,
    );
  }
  getCommandOptions(propertyKey: string): CommandOptions {
    const commandOptions = Reflect.getMetadata(
      DISCORD_COMMAND_OPTIONS_METADATA_KEY,
      this.target,
      propertyKey,
    );
    return commandOptions;
  }
}

export const Command =
  (options: CommandOptions) => (target: any, propertyKey: string) => {
    options.name = options.name?.toLowerCase();
    if (!options?.name) {
      options.name = 'default';
    }
    const handler = new DiscordCommandMetadataHandler(target);
    handler.addCommands(propertyKey);
    handler.setCommandOptions(options, propertyKey);
    return target;
  };
