export class DiscordSimpleError extends Error {}
export class GuildSetupNeeded extends DiscordSimpleError {}
export class AdminNeeded extends DiscordSimpleError {}
export class EntityAlreadyExists extends DiscordSimpleError {
  constructor(entity: string, id: string) {
    super(`${entity} '${id}' já existe`);
  }
}

export class EntityNotFound extends DiscordSimpleError {
  constructor(entity: string, id: string) {
    super(`${entity} '${id}' não encontrado`);
  }
}
