import { Injectable } from '@nestjs/common';
import { BasicService } from '~/utils/basic.service';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from '../inventory/inventory.service';
import { CommandInteraction, MessageCollector } from 'discord.js';
import { Player } from '~/core/player/entities/player.entity';
import { DiscordSimpleError } from '~/discord/exceptions';
import { ResourceProvider } from './entities/resource-provider.entity';
import { ProviderPlayerHistoryService } from './provider-player-history.service';
import { waitForEvent } from '~/utils/wait-for-event';
import { RollEvent } from '~/roll/roll.service';
import { Item } from '../item/entities/item.entity';
import { RollsD10 } from '~/roll/entities/roll.entity';
import { MessageCollectorHelper } from '~/discord/helpers/message-collector-helper';

@Injectable()
export class ResourceProviderService extends BasicService<
  ResourceProvider,
  DeepPartial<ResourceProvider>,
  QueryDeepPartialEntity<ResourceProvider>
> {
  //Keep track if the player is collecting
  private collecting: string[] = [];
  private searching: string[] = [];

  constructor(
    @InjectRepository(ResourceProvider)
    private readonly repo: Repository<ResourceProvider>,
    private readonly eventEmitter: EventEmitter2,
    private readonly inventoryService: InventoryService,
    private readonly historyService: ProviderPlayerHistoryService,
  ) {
    super(repo);
  }

  entityName = 'LootBox';

  private async open(
    i: CommandInteraction,
    provider: ResourceProvider,
    player: Player,
  ) {
    let metaForMaxDrop: number;

    this.collecting.push(player.id);
    let roll: RollsD10;
    try {
      const event: RollEvent = await waitForEvent(
        this.eventEmitter,
        'roll',
        (data: RollEvent) => {
          const samePlayer = data.player.id === player.id;
          const sameChannel = data.interaction.channelId === i.channelId;

          const validRoll = provider.findValidRoll(data.options);
          metaForMaxDrop = validRoll.meta || 3;
          return samePlayer && sameChannel && !!validRoll;
        },
      );
      roll = event.roll;
    } finally {
      this.collecting = this.collecting.filter((id) => id !== player.id);
    }

    const { maxDrop, minDrop, metaForAExtraDrop } = provider;
    const extraMeta = roll.total - metaForMaxDrop;

    const dropPerMeta = (maxDrop - minDrop) / metaForMaxDrop;

    let drops = Math.floor(roll.total * dropPerMeta) + minDrop;
    drops = Math.min(drops, maxDrop);

    if (extraMeta >= metaForAExtraDrop && metaForAExtraDrop !== 0) {
      drops += Math.floor(extraMeta / metaForAExtraDrop);
    }
    let item: Item;
    if (provider.pool) {
      item = await provider.pool.drawItem();
    } else {
      item = provider.item;
    }

    if (provider.individualCooldown) {
      const history = await this.historyService.getHistory(provider, player);
      history.lastTimeOpened = new Date();
      await this.historyService.save(history);
    }
    provider.lastTimeOpened = new Date();
    await this.save(provider);
    return { drops, item };
  }

  private async providerRollsFollowUp(
    i: CommandInteraction,
    provider: ResourceProvider,
  ) {
    const message = await new MessageCollectorHelper(i).prompt(
      `<@${i.user.id}> envie sua ação!`,
    );
    if (message.split(' ').length <= 5) {
      await i.followUp('Ação muito curta...');
      return;
    }
    const possibleRolls = provider.availableRollsMessage();
    const rolls = possibleRolls.join('\nOu ');

    if (possibleRolls.length) {
      await i.followUp(
        `<@${i.user.id}> para coletar o item, por favor role\n` + rolls,
      );
    } else {
      await i.followUp(
        `<@${i.user.id}>, você não sabe como coletar este item...\n`,
      );
    }
    return rolls.length;
  }

  async collectResource(
    i: CommandInteraction,
    player: Player,
    provider: ResourceProvider,
  ) {
    if (this.collecting.includes(player.id)) {
      return i.followUp({
        content: `<@${player.discordId}> já está coletando um item...`,
        ephemeral: true,
      });
    }
    const rolls = await this.providerRollsFollowUp(i, provider);
    if (!rolls) return;

    const { item, drops } = await this.open(i, provider, player);
    if (!drops)
      return i.followUp(`<@${player.discordId}> não conseguiu coletar nada...`);

    const stack = await this.inventoryService.addItemToPlayerInventory(
      player,
      item,
      drops,
    );
    stack.item.rarity = item.rarity;

    return i.followUp({
      content: `<@${player.discordId}> coletou '${item.name} x${drops}'\n`,
      embeds: [stack.toEmbed()],
    });
  }

  async searchResource(player: Player, provider: ResourceProvider) {
    if (!provider.individualCooldown) {
      provider.lastTimeSearched = new Date();
      await this.save(provider);
    }
    const history = await this.historyService.getHistory(provider, player);
    history.lastTimeSearched = new Date();
    await this.historyService.save(history);
  }

  async rollPerception(interaction: CommandInteraction) {
    if (this.searching.includes(interaction.user.id)) {
      throw new DiscordSimpleError(`Você já está procurando por um item...`);
    }
    this.searching.push(interaction.user.id);
    await interaction.followUp(
      `# ${interaction.user} faça uma rolagem de procura\n` +
        '- /dr atributo:Raciocínio hab3:Percepção\n- /dr atributo:Raciocínio hab2:Investigação',
    );
    try {
      const { roll }: RollEvent = await waitForEvent(
        this.eventEmitter,
        'roll',
        (data: RollEvent) => {
          const samePlayer = data.player.discordId === interaction.user.id;
          const sameChannel =
            data.interaction.channelId === interaction.channelId;

          const perceptionRoll =
            data.options.attribute === 'rationality' &&
            (data.options.hab3 === 'perception' ||
              data.options.hab2 === 'investigation');

          return samePlayer && sameChannel && perceptionRoll;
        },
      );
      return roll;
    } finally {
      this.searching = this.searching.filter(
        (id) => id !== interaction.user.id,
      );
    }
  }
}
