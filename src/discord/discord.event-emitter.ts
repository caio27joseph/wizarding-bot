import { ConsoleLogger, Injectable, OnModuleInit } from '@nestjs/common';
import {
  APIApplicationCommandOptionChoice,
  Client,
  Client as DiscordClient,
  Events,
  GatewayIntentBits,
  GuildMember,
  IntentsBitField,
  Interaction,
  MessageContextMenuCommandInteraction,
  MessagePayload,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import {
  CommandOptions,
  DiscordCommandMetadataHandler,
} from './command_metadata_handler';
import { DiscordOptions } from './discord-options';
import {
  DiscordParametersMetadataHandler,
  InteractionOptionEnum,
  InteractionOptions,
  Parameter,
} from './parameter_metadata_handler';
import { GuildService } from '~/core/guild/guild.service';
import {
  AdminNeeded,
  DiscordSimpleError,
  EntityAlreadyExists,
  GuildSetupNeeded,
} from './exceptions';
import {
  GroupOptions,
  getGroupOptions,
  getTargetGroups,
} from './decorators/group.decorator';
import { DiscordEntityVieable } from './types';

export interface Command<T> {
  keys: string[];
  target: any;
  key: string;
  options: CommandOptions;
  parentKey?: string;
  childKeys: string[];
  parameters: Parameter<T>[];
}
class GroupContext {
  public readonly options: GroupOptions;
  public readonly commands: Command<InteractionOptions>[];
  private readonly _commands_map: { [key: string]: Command<any> };
  constructor(private readonly handler: DiscordCommandMetadataHandler) {
    this.options = getGroupOptions(this.handler.target);
    const keys = this.handler.getMethodKeys();
    this.commands = [];
    this._commands_map = {};
    for (const key of keys) {
      const commandOptions = this.handler.getCommandOptions(key);
      if (!commandOptions) continue;
      const childKeys = [
        commandOptions.name,
        ...(commandOptions.aliases || []),
      ];
      const parentKey = commandOptions.name;
      const commandKeys = childKeys.map(
        (k) => (this.options.name ? this.options.name + ' ' : '') + k,
      );
      const handler = new DiscordParametersMetadataHandler(this.handler.target);
      const parameters = handler.getCommandParameters(key).sort((a, b) => {
        return a.index - b.index;
      });
      const command: Command<any> = {
        keys: commandKeys,
        target: this.handler.target,
        key: key,
        options: commandOptions,
        parentKey,
        childKeys,
        parameters,
      };
      this.commands.push(command);
      this._commands_map[command.parentKey] = command;
    }
  }
  public getCommand(key: string) {
    return this._commands_map[key];
  }
}
@Injectable()
export class DiscordEventEmitter implements OnModuleInit {
  public readonly client: DiscordClient;
  private groups: GroupContext[];
  private groupsMap: { [key: string]: GroupContext };
  constructor(
    private readonly options: DiscordOptions,
    private readonly logger: ConsoleLogger,
    private readonly guildService: GuildService,
  ) {
    this.client = new DiscordClient({
      intents: [
        GatewayIntentBits.GuildMessages |
          GatewayIntentBits.MessageContent |
          GatewayIntentBits.Guilds |
          GatewayIntentBits.GuildMembers |
          GatewayIntentBits.GuildMessageReactions |
          IntentsBitField.Flags.GuildMessages,
      ],
    });
  }

  private setGroups(): GroupContext[] {
    const targets = getTargetGroups();
    const handlers = targets.map(
      (target) => new DiscordCommandMetadataHandler(target),
    );
    this.groups = handlers.map((handler) => new GroupContext(handler));
    this.groupsMap = {};

    for (const group of this.groups) {
      this.groupsMap[group.options.name] = group;
    }
    return this.groups;
  }
  onModuleInit() {
    this.logger.setContext('DiscordEventEmitter');
    this.setGroups();
    this.init();
  }
  async init() {
    this.client.on('ready', async (client) => {
      await this.onInteraction();
      await this.registerSlashCommands(client);
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
    });
    await this.client.login(this.options.token);
  }
  private registerCommandParameters(
    cmd: SlashCommandBuilder | SlashCommandSubcommandBuilder,
    parameters: Parameter<InteractionOptions | string>[],
  ) {
    for (const param of parameters) {
      if (!Object.values(InteractionOptionEnum).includes(param?.type as any)) {
        continue;
      }
      let name: string, description: string, required: boolean;
      if (typeof param.options === 'string') {
        name = param.options.toLowerCase();
        description = 'Sem descricao';
        required = true;
      } else {
        name = param.options.name.toLowerCase();
        description = (
          param.options?.description || 'sem descricao'
        ).toLowerCase();
        required =
          param.options?.required === undefined
            ? true
            : param.options?.required === undefined;
      }
      switch (param.type) {
        case InteractionOptionEnum.Boolean:
          cmd.addBooleanOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        case InteractionOptionEnum.User:
          cmd.addUserOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        case InteractionOptionEnum.Integer:
          cmd.addIntegerOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        case InteractionOptionEnum.Channel:
          cmd.addChannelOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        case InteractionOptionEnum.String:
          cmd.addStringOption((option) => {
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required);
            if (typeof param.options === 'string') return option;
            if (param.options?.choices) {
              const choices: APIApplicationCommandOptionChoice<string>[] = [];
              for (const choice of param.options.choices) {
                choices.push({
                  name: choice,
                  value: choice,
                });
              }
              option.setChoices(...choices);
            }
            return option;
          });
          break;
        case InteractionOptionEnum.Mentionable:
          cmd.addMentionableOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        case InteractionOptionEnum.Number:
          cmd.addNumberOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        case InteractionOptionEnum.Role:
          cmd.addRoleOption((option) =>
            option
              .setName(name)
              .setDescription(description)
              .setRequired(required),
          );
          break;
        default:
          break;
      }
    }
  }
  async registerSlashCommands(client: Client<true>) {
    const commands: SlashCommandBuilder[] = [];
    let added_commands = 0;
    for (const group of this.groups) {
      this.logger.debug(`Registering group '${group.options.name}'`);
      const groupCmd = new SlashCommandBuilder();
      groupCmd
        .setName(group.options.name)
        .setDescription(group.options.description);
      for (const command of group.commands) {
        this.logger.debug(
          `Registering command '${command.options.name}' from group '${group.options.name}'`,
        );
        const cmd = new SlashCommandSubcommandBuilder()
          .setName(command.options.name)
          .setDescription(command.options.description);
        groupCmd.addSubcommand(cmd);

        this.registerCommandParameters(cmd, command.parameters);
        added_commands++;
      }
      commands.push(groupCmd);
    }
    await client.application?.commands.set(commands);
    this.logger.debug(`${added_commands} commands registered`);
  }
  private getGroup(key: string) {
    return this.groupsMap[key];
  }

  async onInteraction() {
    this.client.on(
      Events.InteractionCreate,
      async (interaction: MessageContextMenuCommandInteraction) => {
        if (!interaction.isCommand()) return;
        const { commandName } = interaction;
        const group = this.getGroup(commandName);
        if (!group) return;
        const command = group.getCommand(
          (interaction.options as any).getSubcommand(),
        );
        if (!command) return;
        try {
          const args = [];
          const guild = await this.guildService.get(interaction);
          if (command.options.mod) {
            if (!guild) {
              throw new GuildSetupNeeded();
            }
            await guild.verifyMod(interaction.member as GuildMember);
          }
          for (const p of command.parameters) {
            args.push(
              await p.handler(interaction, {
                parameter: p,
                command: command,
                guild,
              }),
            );
          }

          const result: DiscordEntityVieable | undefined = await command.target[
            command.key
          ](...args);
          if (result && !result?.reply) {
            await interaction.reply(
              `Todo: ${typeof result} needs to implement the reply method`,
            );
          } else {
            await interaction.reply(result.reply(interaction));
          }
        } catch (error) {
          try {
            const result = await this.handleErrors(interaction, error);
            await interaction.reply(result);
          } catch (error) {}
        }
      },
    );
  }
  async handleErrors<T extends Error>(
    interaction: Interaction,
    error: T,
  ): Promise<MessagePayload> {
    const message = error?.message;
    if (error instanceof GuildSetupNeeded) {
      const res = new MessagePayload(interaction, {
        content: message || 'Use o comando guild setup para configurar',
        ephemeral: true,
      });
      return res;
    }
    if (error instanceof AdminNeeded) {
      const res = new MessagePayload(interaction, {
        content: message || 'Voce precisa ser um administrador',
        ephemeral: true,
      });
      return res;
    }
    if (error instanceof EntityAlreadyExists) {
      const res = new MessagePayload(interaction, {
        content: message || 'Essa entidade ja existe no sistema',
        ephemeral: true,
      });
      return res;
    }
    if (error instanceof DiscordSimpleError) {
      const res = new MessagePayload(interaction, {
        content: message || 'Erro inesperado!',
        ephemeral: true,
      });
      return res;
    }
    const res = new MessagePayload(interaction, {
      content: `Unexpected Error ${error?.message}`,
      ephemeral: true,
    });
    return res;
  }
}
