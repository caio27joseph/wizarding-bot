import {
  InteractionOptionEnum,
  InteractionOptions,
  parameterDecoratorFactory as simpleFactory,
  interactionDecoratorFactory as factory,
  SlashCommandDecoratorHandler,
} from '../parameter_metadata_handler';

// CREATE A DECORATOR FOR EACH KIND OF SLASH OPTION

export const ArgInteraction = simpleFactory<any>(
  (interaction, opt) => interaction,
);

export const ArgAuthorMember = simpleFactory<any>(
  (interaction, opt) => interaction.member,
);

const argOptionHandler: SlashCommandDecoratorHandler<any> = (
  interaction,
  { parameter },
) => {
  const paramName =
    typeof parameter.options === 'string'
      ? parameter.options.toLowerCase()
      : parameter.options.name.toLowerCase();
  const details = interaction.options.data[0].options.find(
    (data) => data.name === paramName,
  );
  return details?.value;
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
  async (interaction, { parameter }) => {
    const paramName =
      typeof parameter.options === 'string'
        ? (parameter.options as string).toLowerCase()
        : parameter.options.name.toLowerCase();
    const details = interaction.options.data[0].options.find(
      (data) => data.name === paramName,
    );
    const userFromCache = interaction.guild.members.cache.get(
      details?.value as any,
    );
    if (userFromCache) return userFromCache;
    const user = (await interaction.guild.members.fetch()).get(
      details?.value as any,
    );
    return user;
  },
  {
    type: InteractionOptionEnum.User,
  },
);
