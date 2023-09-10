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
} from '~/discord/decorators/message.decorators';
import { DiscordSimpleError } from '~/discord/exceptions';
import {
  ProviderActionType,
  ResourceProvider,
} from '~/items/resource-provider/resource-provider.entity';
import { ResourceProviderService } from '~/items/resource-provider/resource-provider.service';
import { Space } from '~/spaces/space/entities/space.entity';

@Group({
  name: 'pescar',
  description: 'Executar uma ação de pesca.',
})
@Injectable()
export class FishGroup {
  constructor(
    private readonly resourceProviderService: ResourceProviderService,
  ) {}

  @Command({
    name: 'default',
    description: 'Executar uma ação de pesca.',
  })
  async doFish(
    @ArgInteraction()
    interaction: CommandInteraction,
    @ArgSpace()
    space: Space,
    @ArgPlayer()
    player: Player,
  ) {
    await interaction.deferReply({ ephemeral: true });
    const providers = await space.resourceProviders;
    const provider = providers.find(
      (p) => p.actionType === ProviderActionType.FISH,
    );
    if (!provider) {
      throw new DiscordSimpleError('Não há um local de pesca neste local.');
    }

    const possibleRolls = provider.availableRollsMessage();
    const rolls = possibleRolls.join('\nOu ');

    if (possibleRolls.length === 0) {
      await interaction.followUp({
        content: `Você não tem ferramentas para pegar este item...\n`,
      });
      if (provider.rolls.length === 0) {
        return;
      }
      await this.resourceProviderService.collectResource(
        interaction,
        player,
        provider,
      );
    } else {
      await interaction.followUp({
        content: `Caso queira pegar o item, por favor role\n` + rolls,
      });
      await this.resourceProviderService.collectResource(
        interaction,
        player,
        provider,
      );
    }
  }
}
