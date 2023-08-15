export class DiscordSimpleError extends Error {}
export class GuildSetupNeeded extends Error {}
export class AdminNeeded extends Error {}
export class EntityAlreadyExists extends Error {}

export class EntityNotFound extends DiscordSimpleError {
  constructor(entity: string, id: string) {
    super(`${entity} '${id}' não encontrado`);
  }
}
