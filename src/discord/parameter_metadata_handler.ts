import {
  Interaction,
  CacheType,
  Message as DiscordMessage,
  CommandInteraction,
} from 'discord.js';
import { DISCORD_PARAMETERS_METADATA_KEY } from './discord.constants';
import { Command } from './discord.event-emitter';
import { Guild } from '~/core/guild/guild.entity';

export enum InteractionOptionEnum {
  Boolean = 'Boolean',
  Channel = 'Channel',
  Integer = 'Integer',
  Mentionable = 'Mentionable',
  Number = 'Number',
  Role = 'Role',
  String = 'String',
  User = 'User',
}

export type CommandDecoratorHandler<Opt> = (
  message: DiscordMessage<boolean> | Interaction<CacheType>,
  options: {
    command: Command<InteractionOptions>;
    parameter: Parameter<Opt>;
    guild?: Guild;
  },
) => any;
export type SlashCommandDecoratorHandler<Opt> = (
  interaction: CommandInteraction<CacheType>,
  options: {
    command: Command<InteractionOptions>;
    parameter: Parameter<Opt>;
    guild?: Guild;
  },
) => any;

export interface InteractionOptions {
  name: string;
  description?: string;
  required?: boolean;
  choices?: any[];
}

export interface Parameter<T> {
  index: number;
  methodKey?: string | symbol;
  options: T;
  handler: CommandDecoratorHandler<T> | SlashCommandDecoratorHandler<T>;
  field?: string;
  type?: InteractionOptionEnum;
}
export interface ParameterOptions {
  field?: string;
}

export class DiscordParametersMetadataHandler {
  constructor(private readonly target: any) {}

  getCommandParameters(propertyKey: string): Parameter<any>[] {
    const parameters =
      Reflect.getMetadata(
        DISCORD_PARAMETERS_METADATA_KEY,
        this.target,
        propertyKey,
      ) || [];
    return parameters;
  }
  private setCommandParameters(
    parameters: Parameter<any>[],
    propertyKey: string,
  ) {
    Reflect.defineMetadata(
      DISCORD_PARAMETERS_METADATA_KEY,
      parameters,
      this.target,
      propertyKey,
    );
  }
  addCommandParameterDecorator(
    index: number,
    methodKey: string | symbol,
    handler: CommandDecoratorHandler<any>,
    options?: any,
    type?: InteractionOptionEnum,
  ) {
    const parameter: Parameter<any> = {
      index,
      methodKey,
      field: options?.field,
      handler,
      options,
      type,
    };
    const parameters = this.getCommandParameters(methodKey as string);
    parameters.push(parameter);
    this.setCommandParameters(parameters, methodKey as string);
  }
}

export function parameterDecoratorFactory<Opt>(
  handler: CommandDecoratorHandler<Opt>,
) {
  return (options?: Opt) =>
    (target: any, propertyKey: string | symbol, index: number) => {
      const meta = new DiscordParametersMetadataHandler(target);
      meta.addCommandParameterDecorator(index, propertyKey, handler, options);
    };
}

interface SlashDecoratorFactoryOptions {
  type: InteractionOptionEnum;
}

export function interactionDecoratorFactory<Opt>(
  handler: SlashCommandDecoratorHandler<Opt>,
  { type }: SlashDecoratorFactoryOptions,
) {
  return (options: Opt) =>
    (target: any, propertyKey: string | symbol, index: number) => {
      const meta = new DiscordParametersMetadataHandler(target);
      meta.addCommandParameterDecorator(
        index,
        propertyKey,
        handler as any,
        options,
        type,
      );
    };
}
