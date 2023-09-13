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
import { ItemDrop } from '~/items/item/entities/item-drop.entity';
import { ItemDropService } from '~/items/item/item-drop.service';
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
    private readonly itemDropService: ItemDropService,
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
    await interaction.deferReply();
    const providers = await space.resourceProviders;
    const roll = await this.resourceProviderService.rollPerception(interaction);
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
      content: `Você encontrou ${provider.title}!`,
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
        provider.canOpen(player) &&
        provider.metaPerceptionRoll + 1 <= roll.total &&
        provider.canSearch(player) &&
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
        let desc = `**${provider.title}**\n`;
        if (provider.item) {
          desc += `**Descrição:** ${provider.item.description.slice(0, 200)}\n`;
        }
        desc += `\n---`;
        return desc;
      },
      footer(currentPage, totalPages) {
        return `Página ${currentPage}/${totalPages}`;
      },
      itemsPerPage: 5,
    }).followUp(interaction);
  }

  @Command({
    name: 'item',
    description: 'Procura algum item no local',
  })
  async searchItem(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgPlayer()
    player: Player,
    @ArgSpace()
    space: Space,
    @ArgString({
      name: 'nome',
      description: 'Nome do item que você está procurando',
      required: false,
    })
    name?: string,
  ) {
    await interaction.deferReply();
    const roll = await this.resourceProviderService.rollPerception(interaction);
    if (!name) {
      return await this.searchItems(interaction, player, space, roll);
    }
    const drops = await this.itemDropService.findAll({
      where: {
        space: {
          id: space.id,
        },
      },
      relations: {
        item: true,
      },
    });
    const drop = await findClosestMatchInObjects(
      name,
      drops,
      (o) => o.item.name,
      0.8,
    );
    if (!drop || roll.total < drop.meta) {
      await interaction.followUp(
        `<@${player.discordId}> anda pela região procurando, mas não encontra nada`,
      );
      return;
    }

    await interaction.followUp({
      content:
        `Você encontrou ${drop.item.name} x${drop.amount}!\n` +
        'Para pegar digite /item pegar',
      ephemeral: true,
    });
  }

  async searchItems(
    interaction: CommandInteraction,
    player: Player,
    space: Space,
    roll: RollsD10,
  ) {
    const foundDrops: ItemDrop[] = [];
    const drops = await this.itemDropService.findAll({
      where: {
        space: {
          id: space.id,
        },
      },
      relations: {
        item: true,
      },
    });
    for (const drop of drops) {
      if (roll.total >= drop.meta + 2) {
        foundDrops.push(drop);
      }
    }

    if (foundDrops.length === 0) {
      await interaction.followUp(
        `<@${player.discordId}> anda pela região procurando, mas não encontra nada`,
      );
      return;
    }
    new PaginationHelper({
      header: `Você encontrou ${foundDrops.length} items!`,
      items: foundDrops,
      formatter: async (drop, index, objs) => {
        let desc = `**${drop.item.name} **${
          drop.takeable && drop.amount === 1 ? '- Fixo' : `x${drop.amount}`
        }\n`;
        desc += `**Descrição:** ${drop.item.description.slice(0, 200)}\n---`;
        return desc;
      },
      footer(currentPage, totalPages) {
        return `Página ${currentPage}/${totalPages}`;
      },
      itemsPerPage: 5,
    }).followUp(interaction);
  }
}
