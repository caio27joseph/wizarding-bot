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
import {
  InteractionOptionEnum,
  interactionDecoratorFactory,
} from '~/discord/parameter_metadata_handler';
import { InventoryService } from '~/items/inventory/inventory.service';
import { ResourceProvider } from '~/items/resource-provider/resource-provider.entity';
import { ResourceProviderService } from '~/items/resource-provider/resource-provider.service';
import {
  pointsKeyToDisplayMap,
  pointsKeyToTargetDisplayMap,
  pointsKeyToTargetKeyMap,
} from '~/player-system/system-types';
import { RollEvent } from '~/roll/roll.service';
import { Space } from '~/spaces/space/entities/space.entity';
import { findClosestMatchInObjects } from '~/utils/closest-match';
import { addDays, addMinutes } from '~/utils/date.utils';
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
    })
    name: string,
  ) {
    await interaction.reply(
      'Role o dado de percepção\n' + 'Raciocinio + (Percepção ou Investigação)',
    );
    const providers = await space.resourceProviders;
    const provider = await findClosestMatchInObjects(
      name,
      providers,
      (o) => o.item.name,
      0.8,
    );
    const { roll }: RollEvent = await waitForEvent(
      this.eventEmitter,
      'roll',
      (data: RollEvent) => {
        const samePlayer = data.player.id === player.id;
        const sameChannel =
          data.interaction.channelId === interaction.channelId;
        const perceptionRoll =
          data.options.attribute === 'rationality' &&
          (data.options.skill === 'perception' ||
            data.options.knowledge === 'investigation');

        return samePlayer && sameChannel && perceptionRoll;
      },
    );

    if (
      !provider ||
      roll.total < provider.metaPerceptionRoll ||
      !provider.canSearch() ||
      !provider.canOpen()
    ) {
      if (provider) {
        provider.lastTimeSearched = new Date();
        await this.resourceProviderService.save(provider);
      }
      await interaction.followUp(
        `<@${player.discordId}> anda pela região procurando por ${name} mas não encontra nada`,
      );
      return;
    }

    await interaction.followUp({
      content: `Você encontrou ${provider.item.name}!`,
      embeds: [provider.toEmbed(), provider.item.toEmbed()],
    });
    await interaction.followUp({
      content: `Caso queira pegar o item, por favor role /dr ${
        pointsKeyToDisplayMap[provider.rollType1]
      }:${pointsKeyToTargetKeyMap[provider.rollType1][provider.roll1]} + ${
        pointsKeyToDisplayMap[provider.rollType2]
      }:${pointsKeyToTargetKeyMap[provider.rollType2][provider.roll2]}
      `,
    });
    await this.collectResource(interaction, player, provider);
  }
  async collectResource(
    interaction: CommandInteraction,
    player: Player,
    provider: ResourceProvider,
  ) {
    const { roll }: RollEvent = await waitForEvent(
      this.eventEmitter,
      'roll',
      (data: RollEvent) => {
        const samePlayer = data.player.id === player.id;
        const sameChannel =
          data.interaction.channelId === interaction.channelId;
        const rollType1 = data.options[provider.rollType1];
        const rollType2 = data.options[provider.rollType2];
        const rollType3 = provider.rollType3
          ? data.options[provider.rollType3]
          : null;

        const correctRoll =
          provider.roll1 === rollType1 &&
          provider.roll2 === rollType2 &&
          (!provider.rollType3 || provider.roll3 === rollType3);

        return samePlayer && sameChannel && correctRoll;
      },
    );
    const { maxDrop, minDrop, metaForMaxDrop, metaForAExtraDrop } = provider;
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
      content: `Você coletou ${drops} ${provider.item.name}!\n`,
      embeds: [stack.toEmbed()],
    });
    provider.lastTimeSearched = new Date();

    await this.resourceProviderService.save(provider);
  }
}
