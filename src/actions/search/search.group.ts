import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandInteraction } from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { Command } from '~/discord/decorators/command.decorator';
import { Group } from '~/discord/decorators/group.decorator';
import {
  ArgInteraction,
  ArgPlayer,
  ArgSpace,
  ArgString,
} from '~/discord/decorators/message.decorators';
import { PaginationHelper } from '~/discord/helpers/page-helper';
import { ResourceProvider } from '~/items/resource-provider/entities/resource-provider.entity';
import { ResourceProviderService } from '~/items/resource-provider/resource-provider.service';
import { RollsD10 } from '~/roll/entities/roll.entity';
import { RollEvent } from '~/roll/roll.service';
import { Space } from '~/spaces/space/entities/space.entity';
import { findClosestMatchInObjects } from '~/utils/closest-match';
import { waitForEvent } from '~/utils/wait-for-event';

@Group({
  name: 'procurar',
  description: 'Comando para procurar coisas no local',
})
@Injectable()
export class SearchGroup {
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly resourceProviderService: ResourceProviderService,
  ) {}

  @Command({
    name: 'recurso',
    description: 'Procura algum recurso no local',
  })
  async searchResource(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgSpace()
    space: Space,
    @ArgString({
      name: 'nome',
      description: 'Nome do recurso que você está procurando',
      required: false,
    })
    name?: string,
  ) {
    await interaction.reply(
      '# Faça uma rolagem de procurar recurso\n' +
        '- /dr atributo:Raciocínio hab3:Percepção\n - /dr atributo:Raciocinio hab2:Investigação',
    );
    const providers = await space.resourceProviders;
    const { roll }: RollEvent = await waitForEvent(
      this.eventEmitter,
      'roll',
      (data: RollEvent) => {
        const samePlayer = data.player.id === player.id;
        const sameChannel =
          data.interaction.channelId === interaction.channelId;

        const perceptionRoll =
          data.options.attribute === 'rationality' &&
          (data.options.hab3 === 'perception' ||
            data.options.hab2 === 'investigation');

        return samePlayer && sameChannel && perceptionRoll;
      },
    );
    if (!name) {
      return await this.searchResources(interaction, player, space, roll);
    }
    const provider = await findClosestMatchInObjects(
      name,
      providers,
      (o) => o.item.name,
      0.8,
    );
    if (
      !provider ||
      roll.total < provider.metaPerceptionRoll ||
      !provider.canSearch() ||
      !provider.canOpen()
    ) {
      await interaction.followUp(
        `<@${player.discordId}> anda pela região procurando por ${name} mas não encontra nada`,
      );
      return;
    }

    await this.resourceProviderService.searchResource(player, provider);

    await interaction.followUp({
      content: `Você encontrou ${provider.item.name}!`,
      embeds: [provider.toEmbed()],
      ephemeral: true,
    });

    await this.resourceProviderService.collectResource(
      interaction,
      player,
      provider,
    );
  }

  async searchResources(
    interaction: CommandInteraction,
    player: Player,
    space: Space,
    roll: RollsD10,
  ) {
    const foundResources: ResourceProvider[] = [];
    const providers = await space.resourceProviders;
    for (const provider of providers) {
      if (
        provider.canOpen() &&
        provider.metaPerceptionRoll + 1 <= roll.total &&
        provider.canSearch() &&
        provider.public
      ) {
        foundResources.push(provider);
      }
    }

    if (foundResources.length === 0) {
      await interaction.followUp(
        `<@${player.discordId}> anda pela região procurando por recursos mas não encontra nada`,
      );
      return;
    }
    new PaginationHelper({
      header: `Você encontrou ${foundResources.length} recursos!`,
      items: foundResources,
      formatter: async (provider, index, objs) => {
        let desc = `**${provider.item.name}**\n`;
        desc += `**Descrição:** ${provider.item.description}\n`;
        return desc;
      },
      footer(currentPage, totalPages) {
        return `\nPágina ${currentPage}/${totalPages}`;
      },
      itemsPerPage: 5,
    }).followUp(interaction);
  }
}
