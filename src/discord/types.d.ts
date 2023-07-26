export interface DiscordEntityVieable {
  discordView: () => InteractionReplyOptions;
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
