import {
  DISCORD_COMMAND_METHODS_METADATA_KEY,
  DISCORD_COMMAND_OPTIONS_METADATA_KEY,
} from './discord.constants';

export class CommandOptions {
  name: string;
  description: string;
  mod?: boolean;
  aliases?: string[];
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
  getCommandOptions(propertyKey: string): CommandOptions | undefined {
    const commandOptions = Reflect.getMetadata(
      DISCORD_COMMAND_OPTIONS_METADATA_KEY,
      this.target,
      propertyKey,
    );
    return commandOptions;
  }
}
