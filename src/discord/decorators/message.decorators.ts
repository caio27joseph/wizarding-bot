import { GuildMember } from 'discord.js';
import {
  InteractionOptionEnum,
  InteractionOptions,
  parameterDecoratorFactory as simpleFactory,
  interactionDecoratorFactory as factory,
  SlashCommandDecoratorHandler,
} from '../parameter_metadata_handler';
import { DiscordSimpleError, GuildSetupNeeded } from '../exceptions';
import { IOERR } from 'sqlite3';

// CREATE A DECORATOR FOR EACH KIND OF SLASH OPTION

const getInteractionArgValue = (
  interaction,
  paramName: string,
  commandName: string,
) => {
  if (commandName === 'default') {
    return interaction.options.data.find((data) => data.name === paramName)
      ?.value;
  }
  const details = interaction.options.data[0].options.find(
    (data) => data.name === paramName,
  );
  return details?.value;
};

export const ArgInteraction = simpleFactory<any>(
  (interaction, opt) => interaction,
);

export const ArgAuthorMember = simpleFactory<any>(
  (interaction, opt) => interaction.member,
);

export const ArgGuild = simpleFactory((interaction, opt) => {
  if (!opt.guild) {
    throw new GuildSetupNeeded();
  }
  return opt.guild;
});

export const ArgPlayer = simpleFactory((interaction, opt) => {
  const player = opt.playerService.findOne({
    where: {
      discordId: interaction.member.user.id,
      guildId: interaction.guild.id,
    },
  });

  return player;
});

const argOptionHandler: SlashCommandDecoratorHandler<any> = (
  interaction,
  { parameter, command },
) => {
  const paramName =
    typeof parameter.options === 'string'
      ? parameter.options.toLowerCase()
      : parameter.options.name.toLowerCase();
  const commandName = command.options.name.toLowerCase();
  return getInteractionArgValue(interaction, paramName, commandName);
};

export const ArgBoolean = factory<InteractionOptions | string>(
  argOptionHandler,
  { type: InteractionOptionEnum.Boolean },
);
export const ArgChannel = factory<InteractionOptions>(argOptionHandler, {
  type: InteractionOptionEnum.Channel,
});
export const ArgInteger = factory<InteractionOptions>(argOptionHandler, {
  type: InteractionOptionEnum.Integer,
});
export const ArgMentionable = factory<InteractionOptions>(argOptionHandler, {
  type: InteractionOptionEnum.Mentionable,
});
export const ArgNumber = factory<InteractionOptions>(argOptionHandler, {
  type: InteractionOptionEnum.Number,
});
export const ArgRole = factory<InteractionOptions | string>(
  (interaction, { parameter }) => {
    const paramName =
      typeof parameter.options === 'string'
        ? (parameter.options as string).toLowerCase()
        : parameter.options.name.toLowerCase();
    const details = interaction.options.data[0].options.find(
      (data) => data.name === paramName,
    );
    return interaction.guild.roles.cache.get(details?.value as any);
  },
  {
    type: InteractionOptionEnum.Role,
  },
);
export const ArgString = factory<InteractionOptions | string>(
  argOptionHandler,
  {
    type: InteractionOptionEnum.String,
  },
);
export const ArgUser = factory<InteractionOptions | string>(
  async (interaction, { parameter, command }) => {
    const paramName =
      typeof parameter.options === 'string'
        ? (parameter.options as string).toLowerCase()
        : parameter.options.name.toLowerCase();

    const commandName = command.options.name.toLowerCase();
    const value = getInteractionArgValue(interaction, paramName, commandName);
    const userFromCache = interaction.guild.members.cache.get(value);
    if (userFromCache) return userFromCache;
    const user = (await interaction.guild.members.fetch()).get(value);
    return user;
  },
  {
    type: InteractionOptionEnum.User,
  },
);
