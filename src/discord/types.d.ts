type Choice = {
  name: string;
  value: string;
};

export interface DiscordEntityVieable {
  toEmbed(): EmbedBuilder;
  reply(interaction: Interaction): MessagePayload;
}

export interface Command<T> {
  keys: string[];
  target: any;
  key: string;
  options: CommandOptions;
  parentKey?: string;
  childKeys: string[];
  parameters: Parameter<T>[];
}

export class DiscordOptions {
  token: string;
  prefix: string;
}
