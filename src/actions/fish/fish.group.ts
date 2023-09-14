import { Injectable } from '@nestjs/common';
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
import { ProviderActionType } from '~/items/resource-provider/entities/resource-provider.entity';
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
  ) { }

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
      return interaction.followUp({
        content: 'Não há nada para pescar aqui.',
      });
    }
    if (!provider.canOpen(player)) {
      return interaction.followUp({
        content: 'Você perdeu a isca e não conseguiu pescar nada.',
      });
    }
    await this.resourceProviderService.collectResource(
      interaction,
      player,
      provider,
    );
  }
}
