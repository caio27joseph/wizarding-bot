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
import { InventoryService } from '~/items/inventory/inventory.service';
import { ResourceProvider } from '~/items/resource-provider/resource-provider.entity';
import { ResourceProviderService } from '~/items/resource-provider/resource-provider.service';
import { abilitiesKeyToDisplayMap } from '~/player-system/abilities/entities/abilities.entity';
import { attributeKeyToDisplayMap } from '~/player-system/attribute/entities/attributes.entity';
import { extrasKeyToDisplayMap } from '~/player-system/extras/entities/extras.entity';
import { nonConvKeyToDisplayMap } from '~/player-system/nonconv-predilection/entities/nonconv-predilections.entity';
import { witchPredilectionKeyToDisplayMap } from '~/player-system/witch-predilection/entities/witch-predilection.entity';
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
    private readonly inventoryService: InventoryService,
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
      'Role o dado para procurar\n' +
        '/dr atributo:Raciocínio pericia:Percepção\n Ou /dr atributo:Raciocinio conhecimento:Investigação',
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

    if (provider && provider.canSearch()) {
      provider.lastTimeSearched = new Date();
      await this.resourceProviderService.save(provider);
    }

    await interaction.followUp({
      content: `Você encontrou ${provider.item.name}!`,
      embeds: [provider.toEmbed()],
      ephemeral: true,
    });

    const possibleRolls = provider.rolls
      .filter((roll) => !roll.secret)
      .map((roll) => {
        let description = '/dr ';
        if (roll.attribute) {
          description += `**atributo:**${
            attributeKeyToDisplayMap[roll.attribute]
          } `;
        }
        if (roll.hab1) {
          description += `**pericia:**${abilitiesKeyToDisplayMap[roll.hab1]} `;
        }
        if (roll.hab2) {
          description += `**pericia:**${abilitiesKeyToDisplayMap[roll.hab2]} `;
        }
        if (roll.hab3) {
          description += `**pericia:**${abilitiesKeyToDisplayMap[roll.hab3]} `;
        }
        if (roll.magicSchool) {
          description += `**predilecao_bruxa:**${
            witchPredilectionKeyToDisplayMap[roll.magicSchool]
          } `;
        }
        if (roll.nonConvPredilectionsChoices) {
          description += `**predilecao_nao_convencional:**${
            nonConvKeyToDisplayMap[roll.nonConvPredilectionsChoices]
          } `;
        }
        if (roll.extras) {
          description += `**extras:**${extrasKeyToDisplayMap[roll.extras]} `;
        }
        return description;
      });
    const rolls = possibleRolls.join('\nOu ');

    if (possibleRolls.length === 0) {
      await interaction.followUp({
        content: `Você não tem ferramentas para pegar este item...\n`,
      });
      await this.collectResource(interaction, player, provider);
      if (provider.rolls.length === 0) {
        return;
      }
    } else {
      await interaction.followUp({
        content: `Caso queira pegar o item, por favor role\n` + rolls,
      });
    }
    await this.collectResource(interaction, player, provider);
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

  async collectResource(
    interaction: CommandInteraction,
    player: Player,
    provider: ResourceProvider,
  ) {
    let metaForMaxDrop = 3;
    const { roll }: RollEvent = await waitForEvent(
      this.eventEmitter,
      'roll',
      (data: RollEvent) => {
        const samePlayer = data.player.id === player.id;
        const sameChannel =
          data.interaction.channelId === interaction.channelId;

        const validRoll = provider.getValidRoll(data.options);
        metaForMaxDrop = validRoll?.meta || 3;
        return samePlayer && sameChannel && !!validRoll;
      },
    );
    const { maxDrop, minDrop, metaForAExtraDrop } = provider;
    const extraMeta = roll.total - metaForMaxDrop;

    const dropPerMeta = (maxDrop - minDrop) / metaForMaxDrop;

    let drops = Math.floor(roll.total * dropPerMeta) + minDrop;
    drops = Math.min(drops, maxDrop);

    if (extraMeta >= metaForAExtraDrop) {
      drops += Math.floor(extraMeta / metaForAExtraDrop);
    }

    const stack = await this.inventoryService.addItemToPlayerInventory(
      player,
      provider.item,
      drops,
    );

    await interaction.followUp({
      content: `Você coletou '${provider.item.name} x${drops}'\n`,
    });
    provider.lastTimeOpened = new Date();

    await this.resourceProviderService.save(provider);
  }
}
